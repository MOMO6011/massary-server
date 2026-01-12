const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// البيانات الخاصة بيك
const MY_NEW_API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UazVOQ3dpYm1GdFpTSTZJakUzTmpneU5URTNNVFF1TWpZMU1UZ3lJbjAuM0tUS2tqcHJTSThpRThOZUtYVzEzY0txbDAybk9yR3ZWVk4yVHdNR1A0RjZNeXRxY3lULWVLS1ItbFBHU1ZsU0IyZWZUUkwtbDg2X0VYd3JYMXdrWmc=";
const INTEGRATION_ID = 5466353;

app.get('/', (req, res) => {
    res.send('Masary Server is Live and Ready! 🚀');
});

app.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: "المبلغ غير صحيح" });
        }

        // 1. الحصول على الـ Auth Token (رجعناه لـ egypt)
        const authRes = await axios.post('https://egypt.paymob.com/api/auth/tokens', { 
            "api_key": MY_NEW_API_KEY 
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        const token = authRes.data.token;

        // 2. تسجيل الطلب
        const orderRes = await axios.post('https://egypt.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(amount * 100),
            currency: "EGP",
            items: []
        });

        // 3. الحصول على مفتاح الدفع
        const keyRes = await axios.post('https://egypt.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: Math.round(amount * 100),
            expiration: 3600,
            order_id: orderRes.data.id,
            billing_data: {
                "first_name": "Donator", 
                "last_name": "User", 
                "email": "test@masary.com",
                "phone_number": "+201000000000", 
                "apartment": "NA", "floor": "NA", "street": "NA",
                "building": "NA", "postal_code": "NA", "city": "Cairo", 
                "country": "EG", "state": "NA"
            },
            currency: "EGP",
            integration_id: INTEGRATION_ID
        });

        // 4. الرد باللينك النهائي لمحفظة الموبايل
        res.json({ 
            success: true,
            url: `https://egypt.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${keyRes.data.token}` 
        });

    } catch (error) {
        let detailedError = error.message;
        if (error.response && error.response.data) {
            detailedError = error.response.data;
        }

        console.error("Paymob Error:", detailedError);

        res.status(500).json({ 
            error: "فشل في التواصل مع Paymob", 
            details: detailedError 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Masary Server Running`));



const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// الـ API KEY اللي إنت حطيته سليم وشكله لسه معمول له Recreate حالا
const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UazVOQ3dpYm1GdFpTSTZJakUzTmpneU5USTRNVE11TWpFMk5UQTJJbjAuelY1NTJUak9venBRaUVFTnlyQzI1SDZYcVlFMzl1Q0RVR19MSndmajZGS1ZlQS0wZXNsd0VPRGptaV8wV1BBM0M0b3pVcEowb2xwLXlGaGRxdXdtZ1E="; 

// الـ ID الخاص بالمحافظ الإلكترونية (Mobile Wallet)
const INTEGRATION_ID = 5466353; 

app.get('/', (req, res) => res.send('Masary Server is Active! 🚀'));

app.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) return res.status(400).json({ error: "المبلغ مطلوب" });

        // --- الخطوة 1: الـ Auth (استخدام الرابط العالمي api.paymob.com) ---
        // ضفنا Headers صريحة هنا لضمان قبول الـ Credentials
        const authRes = await axios.post('https://api.paymob.com/api/auth/tokens', { 
            "api_key": API_KEY.trim() 
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        const token = authRes.data.token;

        // --- الخطوة 2: تسجيل الطلب ---
        const orderRes = await axios.post('https://api.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(amount * 100),
            currency: "EGP",
            items: []
        });

        // --- الخطوة 3: الـ Payment Key ---
        const keyRes = await axios.post('https://api.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: Math.round(amount * 100),
            expiration: 3600,
            order_id: orderRes.data.id,
            billing_data: {
                "first_name": "Masary", 
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

        // الرد برابط محفظة الموبايل النهائي
        res.json({ 
            success: true,
            url: `https://api.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${keyRes.data.token}` 
        });

    } catch (error) {
        // طباعة تفصيلية للخطأ في الـ Logs عشان نعرف لو فيه مشكلة في الـ Integration ID
        const detailedError = error.response ? error.response.data : error.message;
        console.error("Paymob Error Details:", JSON.stringify(detailedError));
        
        res.status(500).json({ 
            error: "فشل في التواصل مع Paymob", 
            details: detailedError 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Masary Server Live on Port ${PORT}`));

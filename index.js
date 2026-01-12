const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. حط هنا الـ API Key الجديد بعد ما تدوس Recreate
const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UazVOQ3dpYm1GdFpTSTZJakUzTmpneU5USTRNVE11TWpFMk5UQTJJbjAuelY1NTJUak9venBRaUVFTnlyQzI1SDZYcVlFMzl1Q0RVR19MSndmajZGS1ZlQS0wZXNsd0VPRGptaV8wV1BBM0M0b3pVcEowb2xwLXlGaGRxdXdtZ1E="; 

// 2. الـ ID الصح للمحافظ الإلكترونية من صورتك
const INTEGRATION_ID = 5466353; 

app.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body;

        // الخطوة 1: الـ Auth
        const authRes = await axios.post('https://egypt.paymob.com/api/auth/tokens', { 
            "api_key": API_KEY.trim() // الـ trim دي بتشيل أي مسافة زيادة
        });
        const token = authRes.data.token;

        // الخطوة 2: الطلب
        const orderRes = await axios.post('https://egypt.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(amount * 100),
            currency: "EGP",
            items: []
        });

        // الخطوة 3: الـ Payment Key
        const keyRes = await axios.post('https://egypt.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: Math.round(amount * 100),
            expiration: 3600,
            order_id: orderRes.data.id,
            billing_data: {
                "first_name": "Masary", "last_name": "User", "email": "test@masary.com",
                "phone_number": "+201000000000", "city": "Cairo", "country": "EG"
            },
            currency: "EGP",
            integration_id: INTEGRATION_ID
        });

        res.json({ url: `https://egypt.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${keyRes.data.token}` });

    } catch (error) {
        console.error("Error Detail:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "فشل الاتصال", details: error.response ? error.response.data : error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Masary Server Live`));

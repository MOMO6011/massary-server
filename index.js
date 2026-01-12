const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// إعدادات CORS شاملة لكل شيء لضمان عملها على Vercel
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// التعامل اليدوي مع طلبات OPTIONS لفك حظر CORS
app.options('*', cors());

const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UazVOQ3dpYm1GdFpTSTZJakUzTmpneU5USTRNVE11TWpFMk5UQTJJbjAuelY1NTJUak9venBRaUVFTnlyQzI1SDZYcVlFMzl1Q0RVR19MSndmajZGS1ZlQS0wZXNsd0VPRGptaV8wV1BBM0M0b3pVcEowb2xwLXlGaGRxdXdtZ1E="; 
const INTEGRATION_ID = 5466353; 

app.get('/', (req, res) => {
    res.send('Masary Server is Live and Ready! 🚀');
});

app.post('/create-payment', async (req, res) => {
    try {
        let { amount } = req.body;
        
        // تأمين تحويل المبلغ لرقم صحيح (قروش)
        const amountCents = Math.round(parseFloat(amount) * 100);

        if (!amountCents || isNaN(amountCents)) {
            return res.status(400).json({ error: "المبلغ غير صحيح" });
        }

        // 1. الحصول على الـ Auth Token
        const authRes = await axios.post('https://egypt.paymob.com/api/auth/tokens', { 
            "api_key": API_KEY.trim() 
        });
        const token = authRes.data.token;

        // 2. تسجيل الطلب
        const orderRes = await axios.post('https://egypt.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: amountCents,
            currency: "EGP",
            items: []
        });

        // 3. الحصول على مفتاح الدفع
        const keyRes = await axios.post('https://egypt.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: amountCents,
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

        // إرسال الرابط النهائي
        res.json({ 
            success: true,
            url: `https://egypt.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${keyRes.data.token}` 
        });

    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("Paymob Error:", errorData);
        res.status(500).json({ error: "فشل الاتصال بـ Paymob", details: errorData });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));

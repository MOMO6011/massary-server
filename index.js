const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// --- التعديل هنا ---
app.use(cors({
    origin: "*", // بيسمح لأي موقع (زي localhost أو الـ APK) يكلم السيرفر
    methods: ["GET", "POST"], // بيحدد العمليات المسموحة
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// بياناتك السرية
const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UazVOQ3dpYm1GdFpTSTZJakUzTmpneU5ERXhOalF1TURReE1UYzVJbjAua3dBdWhIWDNENDRkY1JSNVBIa25GUHRES1JWbUpFeTFhQTlMeEp3YXRDQzh5WW1WbDY3REhPQ0RHSkFKX1ZiY0xBZUdpaGJmcEplbzJ4ZDNOdlU4LXc=";
const INTEGRATION_ID = 5466353;

app.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body;

        // 1. الحصول على Auth Token
        const authRes = await axios.post('https://egypt.paymob.com/api/auth/tokens', { "api_key": API_KEY });
        const token = authRes.data.token;

        // 2. تسجيل الطلب (Order)
        const orderRes = await axios.post('https://egypt.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(amount * 100), // استخدام Math.round لضمان إنه رقم صحيح
            currency: "EGP",
            items: []
        });

        // 3. الحصول على مفتاح الدفع (Payment Key)
        const keyRes = await axios.post('https://egypt.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: Math.round(amount * 100),
            expiration: 3600,
            order_id: orderRes.data.id,
            billing_data: {
                "first_name": "Donator", "last_name": "User", "email": "test@masary.com",
                "phone_number": "+201000000000", "apartment": "NA", "floor": "NA", "street": "NA",
                "building": "NA", "postal_code": "NA", "city": "Cairo", "country": "EG", "state": "NA"
            },
            currency: "EGP",
            integration_id: INTEGRATION_ID
        });

        const paymentToken = keyRes.data.token;
        const finalUrl = `https://egypt.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${paymentToken}`;
        
        res.json({ url: finalUrl });

    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "فشل في تجهيز عملية الدفع", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`سيرفر مساري شغال على بورت ${PORT}`));

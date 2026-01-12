const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // ده عشان يسمح للتطبيق يكلم السيرفر من غير مشاكل

// --- بياناتك السرية (محدش هيشوفها هنا) ---
const API_KEY = "حط_هنا_الـ_API_KEY_الحقيقي_بتاعك";
const INTEGRATION_ID = 5466353;

app.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body; // المبلغ جاي من التطبيق

        // 1. الحصول على Auth Token
        const authRes = await axios.post('https://egypt.paymob.com/api/auth/tokens', { "api_key": API_KEY });
        const token = authRes.data.token;

        // 2. تسجيل الطلب (Order)
        const orderRes = await axios.post('https://egypt.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: amount * 100, // تحويل لقرش
            currency: "EGP",
            items: []
        });

        // 3. الحصول على مفتاح الدفع (Payment Key)
        const keyRes = await axios.post('https://egypt.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: amount * 100,
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

        // نبعت الرابط النهائي للتطبيق
        const paymentToken = keyRes.data.token;
        const finalUrl = `https://egypt.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${paymentToken}`;
        
        res.json({ url: finalUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "فشل في تجهيز عملية الدفع" });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`سيرفر مساري شغال على بورت ${PORT}`));
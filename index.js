const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // سيبها فاضية كدة عشان تعتمد على إعدادات الـ vercel.json
app.use(express.json());

const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UazVOQ3dpYm1GdFpTSTZJakUzTmpneU5ERXhOalF1TURReE1UYzVJbjAua3dBdWhIWDNENDRkY1JSNVBIa25GUHRES1JWbUpFeTFhQTlMeEp3YXRDQzh5WW1WbDY3REhPQ0RHSkFKX1ZiY0xBZUdpaGJmcEplbzJ4ZDNOdlU4LXc=";
const INTEGRATION_ID = 5466353;

// دالة بسيطة للتأكد إن السيرفر شغال (اختياري)
app.get('/', (req, res) => res.send('Masary Server is Live!'));

app.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body;
        
        // الخطوة 1: Auth
        const authRes = await axios.post('https://egypt.paymob.com/api/auth/tokens', { "api_key": API_KEY });
        const token = authRes.data.token;

        // الخطوة 2: Order
        const orderRes = await axios.post('https://egypt.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(amount * 100),
            currency: "EGP",
            items: []
        });

        // الخطوة 3: Payment Key
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

        res.json({ url: `https://egypt.paymob.com/api/acceptance/iframes/mobile_wallet?payment_token=${keyRes.data.token}` });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));


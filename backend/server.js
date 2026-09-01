require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('URI loaded:', process.env.MONGO_URI ? 'YES' : 'NO');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('Connection error:', err));

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/seed', async (req, res) => {
    try {
        await Product.deleteMany({});
        const sampleProducts = [
            { name: "Classic T-Shirt", price: 25.00, image: "https://via.placeholder.com/250x300", description: "Soft cotton tee" },
            { name: "Denim Jacket", price: 60.00, image: "https://via.placeholder.com/250x300", description: "Timeless denim jacket" },
            { name: "Canvas Sneakers", price: 45.00, image: "https://via.placeholder.com/250x300", description: "Everyday casual sneakers" }
        ];
        await Product.insertMany(sampleProducts);
        res.send('Sample products added!');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;

        const line_items = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
          success_url: 'http://localhost:5500/success.html',
cancel_url: 'http://localhost:5500/index.html',
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
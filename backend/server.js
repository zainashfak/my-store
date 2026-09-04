require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('URI loaded:', process.env.MONGO_URI ? 'YES' : 'NO');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('Connection error:', err));

// --- Email setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendConfirmationEmail(toEmail, order) {
    try {
        const itemsList = order.items
            .map(item => `<li>${item.name} - $${item.price}</li>`)
            .join('');

        await transporter.sendMail({
            from: `"Phantomhood" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Your Phantomhood Order Confirmation',
            html: `
                <h2>Thanks for your order, ${order.customerName}!</h2>
                <p>We've received your order and it's being processed.</p>
                <h3>Order Summary</h3>
                <ul>${itemsList}</ul>
                <p><strong>Total: $${order.totalAmount}</strong></p>
                <p>Shipping to: ${order.address}, ${order.city}</p>
                <p>We'll be in touch about delivery. Questions? Reply to this email.</p>
            `
        });
        console.log('Confirmation email sent to', toEmail);
    } catch (err) {
        console.error('Error sending confirmation email:', err);
    }
}

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
        success_url: 'https://phantomhood.netlify.app/success.html',
cancel_url: 'https://phantomhood.netlify.app/index.html',
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, email, phone, address, city, items, totalAmount } = req.body;

        const newOrder = new Order({
            customerName,
            email,
            phone,
            address,
            city,
            items,
            totalAmount
        });

        await newOrder.save();

        if (email) {
            sendConfirmationEmail(email, newOrder);
        }

        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not place order' });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
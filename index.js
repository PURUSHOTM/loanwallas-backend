const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

let otpStore = {};

app.post('/send-otp', (req, res) => {
    const { phone } = req.body;

    const isValidPhone = /^\+[1-9]\d{1,14}$/.test(phone);
    if (!isValidPhone) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format. Please provide a number in E.164 format.',
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
    client.messages
        .create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        })
        .then((message) => res.status(200).json({ success: true, message: 'OTP sent successfully' }))
        .catch((err) => res.status(500).json({ success: false, message: 'Failed to send OTP', error: err }));
});

app.post('/verify-otp', (req, res) => {
    const { enteredOtp, phone } = req.body;
    const storedData = otpStore[phone];

    if (!storedData) {
        return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    if (Date.now() > storedData.expiresAt) {
        delete otpStore[phone];
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (enteredOtp === storedData.otp) {
        console.log("enteredOtp", enteredOtp, "storedData.otp", storedData.otp);

        delete otpStore[phone];
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the OTP verification API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const dotenv = require('dotenv');
// dotenv.config();

// const sendOtpRoute = require('./routes/sendOtp');
// const verifyOtpRoute = require('./routes/verifyOtp');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.use('/send-otp', sendOtpRoute);
// app.use('/verify-otp', verifyOtpRoute);

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const twilio = require('twilio');

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const otpStore = {};

router.post('/', (req, res) => {
  const { phone } = req.body;

  const isValidPhone = /^\+[1-9]\d{1,14}$/.test(phone);
  if (!isValidPhone) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format. Please use E.164 format.',
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
    .then(() => res.status(200).json({ success: true, message: 'OTP sent successfully' }))
    .catch((err) => res.status(500).json({ success: false, message: 'Failed to send OTP', error: err }));
});

module.exports = router;

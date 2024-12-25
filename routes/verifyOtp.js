const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { phone, enteredOtp } = req.body;

  if (!phone || !enteredOtp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
  }

  const storedData = otpStore[phone];

  if (!storedData) {
    return res.status(400).json({ success: false, message: 'OTP not found or expired' });
  }

  if (Date.now() > storedData.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (enteredOtp === storedData.otp) {
    delete otpStore[phone];
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }
});

module.exports = router;

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const register = async (req, res) => {
  const { firstName, lastName, username, phone, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser = new User({
      username,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires,
      emailVerified: false
    });

    await newUser.save();

    // Simulate sending OTP email
    await sendEmail(email, `Your OTP is: ${otp}`);

    return res.status(201).json({ message: 'Verification required' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const verifyOtp = async (req, res) => {
  console.log('=== [VERIFY OTP] ===');
  console.log('Raw request body:', req.body); // 👈 ADD THIS
  const { email, otp } = req.body;

  console.log('Received Email:', email);
  console.log('Received OTP:', otp);


  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ No user found for email:', email);
      return res.status(400).json({ message: 'Invalid OTP or email.' });
    }

    console.log('✅ User found.');
    console.log('Stored OTP:', user.otp);
    console.log('Stored OTP Expires:', new Date(user.otpExpires).toLocaleString());
    console.log('Email Verified:', user.emailVerified);

    if (user.otp !== otp) {
      console.log('❌ OTP does not match. Expected:', user.otp, 'Got:', otp);
      return res.status(400).json({ message: 'Invalid OTP or email.' });
    }

    if (Date.now() > user.otpExpires) {
      console.log('❌ OTP has expired. Now:', new Date().toLocaleString());
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log('✅ OTP verified successfully for:', email);
    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('❌ Error verifying OTP:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};



const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
    res.status(200).json({
  message: 'Login successful',
  token,
  user: {
    username: user.username,
    email: user.email,
    name: user.name,
    phone: user.phone
  }
});

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const googleAuth = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const username = email;
      const randomPassword = Math.random().toString(36).slice(-8); // generate random password
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({ username, email, password: hashedPassword });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
    res.status(200).json({ message: 'Google login successful', token, user: { username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only update allowed fields
    user.name = `${firstName} ${lastName}`;
    user.phone = phone;

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        name: user.name,
        email: user.email, // Still included in response, not updated
        phone: user.phone,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Google-based login (no password)
const loginWithGoogle = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create user with default password and email as username
      user = new User({
        username: email,
        email,
        password: bcrypt.hashSync(Date.now().toString(), 10), // random password
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '2d',
    });

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get User Profile Info
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email name phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = { register, login, googleAuth, loginWithGoogle, getUserProfile, verifyOtp, updateProfile };
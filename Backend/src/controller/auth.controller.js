const User = require("../models/usermodel");
const generateToken = require("../utils/generateToken");
const { hashPassword, comparePassword } = require("../utils/hashpass");
const generateOtp = require("../utils/otp");
const sendEmail = require("../utils/sendemail");
const Otp = require("../models/otpmodel");
const Post = require("../models/postmodel");

//register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      authProvider: "local",
    });

    const otp = generateOtp();

    await Otp.create({
      user: user._id,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

await sendEmail(
  email,
  "Verify Your Linkora Account",
  `Your OTP is ${otp}`
);

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({ message: "Use Google login" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    user.isDisabled = false;
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: "login ",
      username: user.username,
    });
    await Post.updateMany({ author: user._id }, { $set: { isDisabled: false } });
    await Post.save();
  } catch (error) {
    next(error);
  }
};

//otp verification
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otpRecord = await Otp.findOne({
      user: user._id,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await Otp.deleteMany({ user: user._id });

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

//Logout
exports.logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Logged out successfully" });
};

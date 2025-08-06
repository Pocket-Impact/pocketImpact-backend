import User from "../models/User.js";
import { generateOtp } from "../utils/generateOTP.js";
import generatingPassword from "../utils/generatePassword.js";
import { sendEmail } from "../utils/sendEmail.js";



export const add_user_to_organisation = async (req, res) => {
    const generatedPassword = generatingPassword();
    const { fullname,phonenumber, email, role} = req.body;
    try {
        if (!fullname || !email || !role|| !phonenumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phonenumber)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        const existingUser = await User.findOne({
            email
        }); 
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const user = new User({
            fullname,
            email,
            phonenumber,
            organisation: req.user.organisation,
            role,
            password: generatedPassword // randomly generated password
        });
        await user.save();

        // Send email with the generated password
        const subject = "Welcome to Pocket Impact";
        const text = `Hello ${fullname},\n\nYour account has been created successfully. Here are your login details:\n\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password as soon as possible.\n\nBest regards,\nPocket Impact Team`;
        await sendEmail(email, subject, text);

        res.status(201).json({ message: `We sent a verification code on ${email} please check it before it expires`,  });
    } catch (error) {
        console.error("Error during adding user:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const get_all_users = async (req, res) => {
    try {
        const users = await User.find({ organisation: req.user.organisation }).populate('organisation');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    // Check OTP and expiration
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ message: "OTP expired" });

    // If all good, update verification
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};





export const  resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const { otp, expires } = generateOtp();

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    await sendEmail(
      user.email,
      'Your new OTP code',
      `Your new OTP is: ${otp}. It expires in 10 minutes.`
    );

    res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
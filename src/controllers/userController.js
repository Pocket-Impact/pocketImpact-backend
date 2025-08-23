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
            organisationId: req.user.organisationId,
            role,
            password: generatedPassword // randomly generated password
        });
        await user.save();

        // Send email with the generated password
        const subject = "Welcome to Pocket Impact";
        const text = `Hello ${fullname},\n\nYour account has been created successfully. Here are your login details:\n\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password as soon as possible.\n\nBest regards,\nPocket Impact Team`;
        await sendEmail(email, subject, text);

        res.status(201).json({
          status: "success",
          message: `We sent a verification code on ${email} please check it before it expires`,
          data: { user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } }
        });
    } catch (error) {
        console.error("Error during adding user:", error);
        res.status(500).json({ message: "Could not add user. Please try again later." });
    }
};

export const get_all_users = async (req, res) => {
    try {
        const users = await User.find({ organisationId: req.user.organisation }).populate('organisation').select('-password -__v');
        res.status(200).json({
          status: "success",
          message: "Users fetched successfully",
          data: { users }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Could not fetch users. Please try again later." });
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

    res.status(200).json({
      status: "success",
      message: "Account verified successfully",
      data: { user: { id: user._id, email: user.email, isVerified: user.isVerified } }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "OTP verification failed. Please try again later." });
  }
};

//delete user added to the organisation
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({
          status: "success",
          message: "User deleted successfully",
          data: { user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } }
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Could not delete user. Please try again later." });
    }
};


//update user added to the organisation details
export const updateUser = async (req, res) => {
    const { id,fullname, email, phonenumber, role } = req.body;
    try {
        if (!id || !fullname || !email || !phonenumber || !role) {
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
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.fullname = fullname;
        user.email = email;
        user.phonenumber = phonenumber;
        user.role = role;
        await user.save();
        res.status(200).json({
          status: "success",
          message: "User updated successfully",
          data: { user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } }
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Could not update user. Please try again later." });
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

    res.status(200).json({
      status: "success",
      message: "New OTP sent to your email",
      data: { email: user.email }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Could not resend OTP. Please try again later.' });
  }
};
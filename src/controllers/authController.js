import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import Organisation from "../models/Organisation.js";
import User from "../models/User.js";
import { generateOtp } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const { otp, expires } = generateOtp();

export const create_new_account = async (req, res) => {

    const { fullname, email, phonenumber, organisationName, organisationCountry, organisationSize, password } = req.body;
    try {

        if (!fullname || !email || !phonenumber || !organisationName || !organisationCountry || !organisationSize || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // verify every field if it meets the requirements
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // verify if the email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // verify if the phone number is valid
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phonenumber)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        let organisation = await Organisation.findOne({
            organisationName,
            organisationCountry,
            organisationSize
        });


        if (!organisation) {
            organisation = new Organisation({
                organisationName,
                organisationCountry,
                organisationSize
            });
            await organisation.save();
        }
        else {
            return res.status(400).json({ message: "Organisation already exists ask your admin to add you to the organisation" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const user = new User({
            fullname,
            email,
            phonenumber,
            organisation: organisation._id,
            role: 'admin',
            password,
            isVerified: false,
            otp,
            otpExpires: expires
        });
        await user.save();

        //send verification email
        const subject = "Verify your account";
        const text = `Your OTP is ${otp}. It is valid for 10 minutes.`;
        await sendEmail(email, subject, text);
        res.status(201).json({
            status: "success",
            message: ["User created successfully", "Please check your email for the OTP to verify your account"],
            data: { user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } }
        });

    } catch (error) {
        console.error("Error during signup:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.login(email, password);
        // check if user is verified
        // if (!user.isVerified) {
        //     return res.status(403).json({ message: "Please verify your email to continue. through a verification link we gave you" });
        // }
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.status(200).json({
            status: "success",
            message: "Login successfuly",
            //include
            data: {
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                    organisationName: user.organisationName
                }
            }
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(400).json({ message: "Invalid email or password", error: error.message });
    }
};

export const refresh = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token missing' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        });

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000 // 15 min
        });

        return res.status(200).json({
            status: "success",
            message: "Token refreshed"
        });
    });
};

export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old password and new password are required", field: "general" });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password", field: "oldPassword" });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Could not change password. Please try again later." });
    }
};

// implementing token based password reset



export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account found with that email address.' });

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token & expiry to DB
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        // Send email with raw token in reset link
        const resetURL = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;
        const message = `Reset your password using this link (valid 10 min): ${resetURL}`;

        await sendEmail(user.email, 'Password Reset', message);

        res.status(200).json({
            status: "success",
            message: "Password reset link sent to your email."
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Could not process password reset. Please try again later.' });
    }
};


export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired password reset token.' });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Password has been reset successfully."
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Could not reset password. Please try again later.' });
    }
};

export const check = (req, res) => {
    res.status(200).json({
        status: 'success',
        user: req.user
    });
}

export const logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({
        status: "success",
        message: "Logout successful"
    });
};
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

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


        const user = new User({
            fullname,
            email,
            phonenumber,
            organisationId: organisation._id,
            role: 'admin',
            password,
            isVerified: false,
            otp,
            otpExpires: expires
        });
        await user.save();

        //send verification email
        const subject = "Verify your account";
        const text = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your OTP</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Import Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#191C1F; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

  <!-- Hidden preview text -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Your OTP is inside! It expires in 10 minutes.
  </div>

  <table width="100%" style="background-color:#191C1F; padding:24px;" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px; background-color:#1e1e1f; border-radius:12px; overflow:hidden;" cellpadding="0" cellspacing="0">
        
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #2D4C35, #191C1F); padding:24px 20px;">
              <h1 style="color:#ffffff; font-size:24px; margin:0; font-weight:700; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',sans-serif;">
                Pocket Impact — OTP Verification
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 20px; color:#e2e8f0; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',sans-serif;">
              <p style="font-size:16px; margin:0 0 16px;">Hey there,</p>
              <p style="font-size:16px; margin:0 0 20px;">
                Use the code below to complete your login. It’s valid for the next 
                <strong style="color:#9ae6b4;">10 minutes</strong>.
              </p>
              
              <!-- OTP Code -->
              <div style="text-align:center; margin:24px 0;">
                <div style="display:inline-block; background:#101112; border:2px solid #2D4C35; border-radius:8px; padding:24px 16px;">
                  <span style="font-family:Consolas, 'Courier New', monospace; font-size:32px; font-weight:700; letter-spacing:8px; color:#ffffff;">${otp}</span>
                </div>
              </div>

              <p style="font-size:14px; margin:0;">If you didn’t request this, you can safely ignore this email — your account stays secure.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#191C1F; color:#9ca3af; font-size:12px; padding:20px; text-align:center; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',sans-serif;">
              <p style="margin:4px 0;">Sent by <strong>Pocket Impact</strong></p>
              <p style="margin:4px 0;">This code is valid for 10 minutes. Need help? Contact support.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
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
        console.log("user created");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie('accessToken', accessToken, {
            maxAge: 60 * 60 * 1000, // 1hr
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
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
                    organisationName: user.organisationName,
                    organisationId: user.organisationId
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
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
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
        const resetURL = `${process.env.CLIENT_URL || "http://localhost:3000/"}api/auth/reset-password?token=${resetToken}`;
const subject = "Reset Your Password - Pocket Impact";

const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Import Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#191C1F; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

  <!-- Hidden preview text -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Reset your Pocket Impact password — link valid for 10 minutes.
  </div>

  <table width="100%" style="background-color:#191C1F; padding:24px;" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px; background-color:#1e1e1f; border-radius:12px; overflow:hidden;" cellpadding="0" cellspacing="0">
        
          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #2D4C35, #191C1F); padding:24px 20px;">
              <h1 style="color:#ffffff; font-size:24px; margin:0; font-weight:700;">Reset Your Password</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 24px; color:#e2e8f0;">
              <p style="font-size:16px; margin:0 0 16px;">Hi,</p>
              <p style="font-size:16px; margin:0 0 20px;">
                You recently requested to reset your password. Click the button below to set up a new one.  
                This link is valid for the next <strong style="color:#9ae6b4;">10 minutes</strong>.
              </p>

              <!-- Reset Link -->
              <div style="text-align:center; margin:24px 0;">
                <a href="${resetURL}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #2D4C35, #191C1F); color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-size:16px; font-weight:600;">
                  Reset Password
                </a>
              </div>

              <p style="font-size:14px; margin:0 0 16px;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="font-size:14px; word-break:break-all; margin:0; color:#9ca3af;">
                ${resetURL}
              </p>

              <p style="font-size:14px; margin:20px 0 0 0;">
                If you didn’t request this, please ignore this email — your account will remain secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#191C1F; color:#9ca3af; font-size:12px; padding:20px; text-align:center;">
              <p style="margin:4px 0;">© 2025 Pocket Impact — All rights reserved.</p>
              <p style="margin:4px 0;">"AI-Powered Tools to Supercharge Your Social Impact"</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


        await sendEmail(user.email, subject, message);

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
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
    });
    res.status(200).json({
        status: "success",
        message: "Logout successful"
    });
};
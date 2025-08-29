import User from "../models/User.js";
import { generateOtp } from "../utils/generateOTP.js";
import generatingPassword from "../utils/generatePassword.js";
import { sendEmail } from "../utils/sendEmail.js";

export const add_user_to_organisation = async (req, res) => {
  const generatedPassword = generatingPassword();
  const { fullname, phonenumber, email, role } = req.body;
  try {
    if (!fullname || !email || !role || !phonenumber) {
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
      email,
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
      isVerified: true,
      password: generatedPassword, // randomly generated password
    });
    await user.save();

    // Send email with the generated password
    const subject = "Welcome to Pocket Impact";
    const text = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Pocket Impact</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Import Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#191C1F; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

  <!-- Hidden preview text -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Welcome to Pocket Impact — your account is ready!
  </div>

  <table width="100%" style="background-color:#191C1F; padding:24px;" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px; background-color:#1e1e1f; border-radius:12px; overflow:hidden;" cellpadding="0" cellspacing="0">
        
          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #2D4C35, #191C1F); padding:24px 20px;">
              <h1 style="color:#ffffff; font-size:24px; margin:0; font-weight:700;">Welcome to Pocket Impact 🚀</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 24px; color:#e2e8f0; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',sans-serif;">
              <p style="font-size:16px; margin:0 0 16px;">Hi <strong>${fullname}</strong>,</p>
              <p style="font-size:16px; margin:0 0 20px;">
                We’re excited to have you on board! 🎉 Your account has been created successfully. Here are your login details:
              </p>

              <!-- Credentials Card -->
              <div style="background:#101112; border:2px solid #2D4C35; border-radius:8px; padding:20px; margin:20px 0;">
                <p style="margin:0; font-size:15px;"><strong>Email:</strong> ${email}</p>
                <p style="margin:6px 0 0 0; font-size:15px;"><strong>Temporary Password:</strong> ${generatedPassword}</p>
              </div>

              <p style="font-size:15px; margin:0 0 20px; color:#9ae6b4;">
                ⚠️ For your security, please log in immediately and update your password.
              </p>

              <p style="font-size:15px; margin:0 0 20px;">
                We’re thrilled to have you with us. Let’s create impact together. 💡
              </p>

              <p style="font-size:15px; margin:0;">Best regards,<br><strong>The Pocket Impact Team</strong></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#191C1F; color:#9ca3af; font-size:12px; padding:20px; text-align:center; font-family:'Bricolage Grotesque','Bricolage Grotesque Fallback',sans-serif;">
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
    await sendEmail(email, subject, text);

    res.status(201).json({
      status: "success",
      message: `We sent a verification code on ${email} please check it before it expires`,
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error during adding user:", error);
    res
      .status(500)
      .json({ message: "Could not add user. Please try again later." });
  }
};



export const get_all_users = async (req, res) => {
  try {
    const users = await User.find({ organisationId: req.user.organisation })
      .populate("organisation")
      .select("-password -__v");
    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: { users },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Could not fetch users. Please try again later." });
  }
};



export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    // Check OTP and expiration
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    // If all good, update verification
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Account verified successfully",
      data: {
        user: { id: user._id, email: user.email, isVerified: user.isVerified },
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res
      .status(500)
      .json({ message: "OTP verification failed. Please try again later." });
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
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Could not delete user. Please try again later." });
  }
};

//update user added to the organisation details
export const updateUser = async (req, res) => {
  const { id, fullname, email, phonenumber, role } = req.body;
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
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Could not update user. Please try again later." });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const { otp, expires } = generateOtp();

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    await sendEmail(
      user.email,
      "Your new OTP code",
      `<!DOCTYPE html>
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
`
    );

    res.status(200).json({
      status: "success",
      message: "New OTP sent to your email",
      data: { email: user.email },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res
      .status(500)
      .json({ message: "Could not resend OTP. Please try again later." });
  }
};

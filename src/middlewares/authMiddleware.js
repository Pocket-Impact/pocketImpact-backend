import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const protect = async(req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({
            status: "fail",
            message: "Access denied. No authentication token provided."
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "Access denied. User not found or no longer exists."
            });
        }
        req.user = { id: user._id, role: user.role, organisation: user.organisation };
        next();
    } catch (error) {
        res.status(401).json({
            status: "fail",
            message: "Invalid or expired authentication token. Please log in again."
        });
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "fail",
                message: "Forbidden. You do not have permission to perform this action."
            });
        }
        next();
    };
};

export const requireVerifiedUser = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.isVerified) {
    return res.status(403).json({
        status: "fail",
        message: "Email verification required. Please verify your email to continue."
    });
  }
  next();
};
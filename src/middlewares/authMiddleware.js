import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};



export const protect = async(req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        req.user = { id: user._id, role: user.role, organisation: user.organisation };
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action" });
        }
        next();
    };
};

export const requireVerifiedUser = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user || !user.isVerified) {
    return res.status(403).json({ message: "Please verify your email to continue." });
  }

  next();
};
import { createToken } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";



export const add_user_to_organisation = async (req, res) => {
    const { fullname,phonenumber, email, role} = req.body;
    try {
        if (!fullname || !email || !role|| !phonenumber) {
            return res.status(400).json({ message: "All fields are required" });
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
            password: 'All1n0n3pa550wrd' // using default password for now
        });
        await user.save();
        res.status(201).json({ message: "User added successfully", user });
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
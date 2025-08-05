import { createToken } from "../middlewares/authMiddleware.js";
import Organisation from "../models/Organisation.js";
import User from "../models/User.js";


export const create_new_account = async (req, res) => {
    const { fullname, email, phonenumber, organisationName, organisationCountry, organisationSize, password } = req.body;
    try {

        if (!fullname || !email || !phonenumber || !organisationName || !organisationCountry || !organisationSize || !password) {
            return res.status(400).json({ message: "All fields are required" });
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
            password
        });
        await user.save();
        res.status(201).json({ message: "User created successfully", user });
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
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = createToken(user._id);
        const maxAge = 3 * 24 * 60 * 60; 
        res.cookie('jwt', token, {
            maxAge: maxAge * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',

        });
        res.status(200).json({
            message: "Login successful", user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(400).json({ message: "Invalid email or password", error: error.message });
    }
};
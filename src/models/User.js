import mongoose from "mongoose";
import bcrypt from "bcrypt";
import roles from "../utils/roles.js";
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    phonenumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\+?[1-9]\d{1,14}$/.test(v);
            }
            ,
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
    },
    role: {
        type: String,
        required: true,
          enum: [roles.ADMIN, roles.ANALYST, roles.RESEARCHER],

        default: 'user',
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

}, {
    timestamps: true,
});
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        //fetch for users organisation details

        if (isMatch) {

            const organisation = await mongoose.model('Organisation').findById(user.organisation).select('organisationName organisationCountry organisationSize');


            return {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
                phonenumber: user.phonenumber,
                organisationName: organisation.organisationName,
            };
        }
        throw new Error('Incorrect email or password!');
    }
    throw new Error('Incorrect email or password!');
}





const User = mongoose.model('User', userSchema);

export default User;


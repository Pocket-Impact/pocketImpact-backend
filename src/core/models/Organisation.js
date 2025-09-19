import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema({
    organisationName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    organisationCountry: {
        type: String,
        required: true,
        trim: true,
    },
    organisationSize: {
        type: String,
        required: true,
        enum: ['small', 'medium', 'large'],
    }
}, {
    timestamps: true,
});
const Organisation = mongoose.model('Organisation', organisationSchema);

export default Organisation;

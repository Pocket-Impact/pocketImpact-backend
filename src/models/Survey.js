import mongoose from 'mongoose';
import crypto from 'crypto';
const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['text', 'rating', 'choice'],
        default: 'text',
    },
    options: {
        type: [String],
        validate: {
            validator: function (v) {
                return this.type !== 'choice' || (this.type === 'choice' && v.length > 0);
            },
            message: 'Options are required for choice type questions',
        },
    },
},{
    _id: true 
});

const surveySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'At least one question is required in the survey',
        },
    },
    uniqueLinkId: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        default: () => crypto.randomBytes(8).toString('hex'),
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

const Survey = mongoose.model('Survey', surveySchema);

export default Survey;
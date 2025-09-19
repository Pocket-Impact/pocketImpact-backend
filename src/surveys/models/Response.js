import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    answer: {
        type: mongoose.Schema.Types.Mixed, // text, number, or option
        required: true,
    },
    sentiment: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: null, // null means not yet analyzed
    },
});

const responseSchema = new mongoose.Schema({
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
    },
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    responses: {
        type: [answerSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'At least one response is required',
        },
    },
}, {
    timestamps: true,
});

const Response = mongoose.model('Response', responseSchema);
export default Response;

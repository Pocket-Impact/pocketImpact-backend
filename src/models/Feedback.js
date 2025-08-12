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
});

const feedbackSchema = new mongoose.Schema({
    
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
    },
    feedbacks: {
        type: [answerSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'At least one feedback is required',
        },
    },
}, {
    timestamps: true, // gives you createdAt, updatedAt
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;

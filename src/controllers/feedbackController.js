import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
    const { surveyId, feedbacks } = req.body;

    if (!surveyId || !feedbacks || feedbacks.length === 0) {
        return res.status(400).json({ message: "Survey ID and feedback are required." });
    }
    try {
        const newFeedback = new Feedback({
            survey: surveyId,
            feedbacks
        })
        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully." });
    } catch (error) {
        console.error("Error submitting feedback:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getFeedbackBySurvey = async (req, res) => {
    const { surveyId } = req.params;
    if (!surveyId) {
        return res.status(400).json({ message: "Survey ID is required." });
    }
    try {
        const feedbacks = await Feedback.find({ survey: surveyId })
            .populate('survey', 'title description')
            .sort({ createdAt: -1 });
        if (feedbacks.length === 0) {
            return res.status(404).json({ message: "No feedback found for this survey." });
        }
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

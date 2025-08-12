import Feedback from "../models/Feedback.js";
import Survey from "../models/Survey.js";

export const submitFeedback = async (req, res) => {
    const { surveyId, feedbacks } = req.body;

    if (!surveyId || !feedbacks || feedbacks.length === 0) {
        return res.status(400).json({ message: "Survey ID and feedback are required." });
    }
    try {
        const newFeedback = new Feedback({
            surveyId,
            feedbacks
        })
        await newFeedback.save();
        
        res.status(201).json({
            status: "success",
            message: "Feedback submitted successfully.",
            data: { feedback: newFeedback }
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Could not submit feedback. Please try again later." });
    }
};

export const getFeedbackBySurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const feedbacks = await Feedback.find({ surveyId }).exec();

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({ message: "No feedback found for this survey." });
    }

    const survey = await Survey.findById(surveyId).exec();
    if (!survey) {
      return res.status(404).json({ message: "Survey not found." });
    }

    const feedbacksWithQuestions = feedbacks.map(feedback => {
      const mappedAnswers = feedback.feedbacks.map(answer => {
        const question = survey.questions.find(q => q._id.equals(answer.questionId));
        return {
          questionId: answer.questionId,
          answer: answer.answer,
          questionText: question?.questionText || 'Question not found',
          options: question?.options || [],
        };
      });

      return {
        _id: feedback._id,
        surveyId: feedback.surveyId,
        feedbacks: mappedAnswers,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      };
    });

    res.status(200).json({
      status: "success",
      data: feedbacksWithQuestions,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error while fetching feedback." });
  }
};
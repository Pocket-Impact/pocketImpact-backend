import Feedback from "../models/Feedback.js";
import { analyzeSentiment } from "../utils/sentimentAnalysis.js";

export const submitFeedback = async (req, res) => {
  try {
    const { organisationId, message, category } = req.body;
    if (!organisationId || !message)
      return res.status(400).json({
        status: "fail",
        message: "Organisation and message are required.",
      });

    const feedback = await Feedback({
      organisationId,
      message,
      category,
    });

    await feedback.save();

    res.status(201).json({
      status: "success",
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

export const getFeedbackByOrganisation = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    if (!organisationId)
      return res
        .status(400)
        .json({ status: "fail", message: "Organisation ID is required." });
    const feedbacks = await Feedback.find({ organisationId })
      .select("-__v")
      .sort({ createdAt: -1 });
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No feedback found for this organisation.",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Feedback fetched successfully.",
      data: feedbacks,
    });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({
      status: "fail",
      message: "Could not fetch feedback. Please try again later.",
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ status: "fail", message: "Feedback ID is required." });
    }
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res
        .status(404)
        .json({ status: "fail", message: "Feedback not found." });
    }
    res
      .status(200)
      .json({ status: "success", message: "Feedback deleted successfully." });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({
      status: "fail",
      message: "Could not delete feedback. Please try again later.",
    });
  }
};
export const analyzeUnprocessedFeedbacks = async (req, res) => {
  try {
    const orgId = req.user.organisationId; // get organisation ID from logged-in user

    // Find feedbacks that have not been analyzed yet
    const feedbacks = await Feedback.find({
      organisationId: orgId,
      sentiment: null, // unanalyzed
    });

    if (feedbacks.length === 0) {
      return res.status(200).json({ message: "No feedbacks to analyze." });
    }

    // Require minimum 50 feedbacks
    // if (feedbacks.length < 50) {
    //   return res
    //     .status(400)
    //     .json({
    //       message:
    //         `At least 50 feedbacks required to run analysis. you have ${feedbacks.length}`,
    //     });
    // }

    // Analyze all feedbacks concurrently
    await Promise.all(
      feedbacks.map(async (fb) => {
        const result = await analyzeSentiment(fb.message);
        console.log(result, 'ok here are the results');
        
        fb.sentiment = result[0].label?.toLowerCase(); // make lowercase to match schema
        await fb.save();
      })
    );

    res.status(200).json({
      status: "success",
      message: `${feedbacks.length} feedbacks analyzed successfully.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

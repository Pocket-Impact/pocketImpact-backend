import Feedback from "../models/Feedback.js";


export const submitFeedback = async (req, res) => {
  try {
    const { organisationId, message,category } = req.body;
    if (!organisationId || !message)
      return res.status(400).json({ status: "fail", message: "Organisation and message are required." });

    const feedback = await Feedback({
      organisationId,
      message,
      category
    });

    await feedback.save();

    res.status(201).json({ status: "success", message: "Feedback submitted successfully.", data: feedback });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

export const getFeedbackByOrganisation = async (req, res) => {
  try {
    const { organisationId } = req.params;
    if (!organisationId) return res.status(400).json({ status: "fail", message: "Organisation ID is required." });
    const feedbacks = await Feedback.find({ organisationId })
      .select('-__v')
      .sort({ createdAt: -1 });
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({ status: "fail", message: "No feedback found for this organisation." });
    }
    res.status(200).json({ status: "success", message: "Feedback fetched successfully.", data: feedbacks });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ status: "fail", message: "Could not fetch feedback. Please try again later." });
  }
};
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: "fail", message: "Feedback ID is required." });
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) return res.status(404).json({ status: "fail", message: "Feedback not found." });
    res.status(200).json({ status: "success", message: "Feedback deleted successfully." });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({ status: "fail", message: "Could not delete feedback. Please try again later." });
  }
};
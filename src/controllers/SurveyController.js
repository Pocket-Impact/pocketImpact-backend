import Survey from '../models/Survey.js';
import { sendEmail } from '../utils/sendEmail.js';

// Controller to create a new survey
export const createSurvey = async (req, res) => {
    const { title, description, questions, createdBy } = req.body;

    if (!title || !questions || Array.isArray(questions) && questions.length === 0) {
        return res.status(400).json({ message: "Title, questions, organisation, and createdBy are required." });
    }    
    try {
        const survey = new Survey({
            title,
            description,
            questions,
            organisationId: req.user.organisationId, // Use organisation from authenticated user
            createdBy: req.user.id,
        });
        await survey.save();
        res.status(201).json({
          status: "success",
          message: "Survey created successfully.",
          data: { survey }
        });
    } catch (error) {
        console.error("Error creating survey:", error);
        res.status(500).json({ message: "Could not create survey. Please try again later." });
    }
};

//send survey by unique link ID in email
export const sendEmailsWithSurveyLink = async (req, res) => {
    const { surveyId, emails } = req.body;
    if (!surveyId || !emails || !Array.isArray(emails)) {
        return res.status(400).json({ message: "surveyId and emails are required." });
    }
    try {
        const survey = await Survey.findOne({ _id: surveyId });
        if (!survey) {
            return res.status(404).json({ message: "Survey not found." });
        }
        //-----------------------------------------
        const surveyLink = `${process.env.FRONTEND_URL || "http://localhost:3000/api"}/surveys/unique/${survey.uniqueLinkId}`;
    const subject = "We'd love your response! Please complete this survey";
        const text = `
        
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
  <h2 style="color: #2e86de;">Hey there! 👋</h2>

  <p style="font-size: 16px;">
    We really care about what you think — and we’d love it if you could take just a few minutes to complete this short survey.
  </p>

  <p style="font-size: 16px;">
    Click the magic link below to get started:
  </p>

  <p style="text-align: center; margin: 30px 0;">
    <a href="${surveyLink}" 
       style="background-color: #2ecc71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
       🚀 Start Survey
    </a>
  </p>

  <p style="font-size: 15px;">
    Your answers help us improve and serve you better — so thank you in advance! 🙌
  </p>

  <p style="margin-top: 30px; font-size: 14px; color: #777;">
    Cheers,<br />
    The Team
  </p>
</div>
        `;
        await Promise.all(
            emails.map(email =>
                 sendEmail(email, subject, text)
                )
            );
        res.status(200).json({
          status: "success",
          message: "Emails sent successfully.",
          data: { surveyId }
        });


    } catch (error) {
        console.error("Error sending emails with survey link:", error);
        res.status(500).json({ message: "Could not send survey emails. Please try again later." });
    }
};

// Controller to get all surveys for an organisation
export const getSurveysByOrganisation = async (req, res) => {
    
    const organisationId  = req.user.organisationId;
    if (!organisationId) {
        return res.status(400).json({ message: "Organisation ID is required." });
    }
    try {
        const surveys = await Survey
            .find({ organisationId: organisationId })
            .select('-__v')
            .populate('createdBy', 'fullname email') // Populate createdBy with user details
            .sort({ createdAt: -1 });
        res.status(200).json({
          status: "success",
          message: "Surveys fetched successfully.",
          data: { surveys }
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ message: "Could not fetch surveys. Please try again later." });
    }
};

export const getSurveryByUniqueLinkId = async (req, res) => {
    const { uniqueLinkId } = req.params;
    if (!uniqueLinkId) {
        return res.status(400).json({ message: "Unique link ID is required." });
    }
    try {
        const survey = await Survey
            .findOne({ uniqueLinkId })
            .select('-__v')
            .populate('createdBy', 'fullname email') // Populate createdBy with user details
            .populate('organisationId', 'organisationName organisationCountry organisationSize');
        if (!survey) {
            return res.status(404).json({ message: "Survey not found." });
        }
        res.status(200).json({
          status: "success",
          message: "Survey fetched successfully.",
          data: { survey }
        });
    }
    catch (error) {
        console.error("Error fetching survey by unique link ID:", error);
        res.status(500).json({ message: "Could not fetch survey. Please try again later." });
    }
};

// delete survey by ID
export const deleteSurveyById = async (req, res) => {
    const { surveyId } = req.params;
    if (!surveyId) {
        return res.status(400).json({ message: "Survey ID is required." });
    }
    try {
        const survey = await Survey.findByIdAndDelete(surveyId);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found." });
        }
        res.status(200).json({
          status: "success",
          message: "Survey deleted successfully.",
          data: { surveyId }
        });
    } catch (error) {
        console.error("Error deleting survey:", error);
        res.status(500).json({ message: "Could not delete survey. Please try again later." });
    }
};

// update survey by ID
export const updateSurveyById = async (req, res) => {
    const { surveyId } = req.params;
    const { title, description, questions } = req.body;
    if (!surveyId || !title || !questions || Array.isArray(questions) && questions.length === 0) {
        return res.status(400).json({ message: "Survey ID, title, and questions are required." });
    }
    try {
        const survey = await Survey.findByIdAndUpdate(surveyId, {
            title,
            description,
            questions
        }, { new: true, runValidators: true });
        if (!survey) {
            return res.status(404).json({ message: "Survey not found." });
        }
        res.status(200).json({
          status: "success",
          message: "Survey updated successfully.",
          data: { survey }
        });
    } catch (error) {
        console.error("Error updating survey:", error);
        res.status(500).json({ message: "Could not update survey. Please try again later." });
    }
};
import Response from "../models/Response.js";
import Survey from "../models/Survey.js";
import { analyzeAnswerSentiment } from "../utils/sentimentAnalysis.js"; // Assuming you have a utility for sentiment analysis
export const submitResponse = async (req, res) => {
    const { surveyId, responses } = req.body;



    if (!surveyId || !responses || responses.length === 0) {
    return res.status(400).json({ message: "Survey ID and responses are required." });
    }
   

    try {

        // run seniment analysis if needed
        responses.forEach(answer => {
            if (typeof answer.answer === 'string') {
                const sentimentResult = analyzeAnswerSentiment(answer.answer);
                answer.sentiment = sentimentResult.sentiment; // Add sentiment to the answer
            }

        });
        
        const survey = await Survey.findById(surveyId).exec();
        if (!survey) {
            return res.status(404).json({ message: "Survey not found." });
        }
        const organisationId = survey.organisationId;
        
        console.log(organisationId);
        
        const newResponse = new Response({
            organisationId, 
            surveyId,
            responses
        })
        await newResponse.save();

        res.status(201).json({
            status: "success",
            message: "Response submitted successfully.",
            data: { response: newResponse }
        });
    } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Could not submit response. Please try again later." });
    }
};

export const getResponsesBySurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;

    const responses = await Response.find({ surveyId }).exec();

        if (!responses || responses.length === 0) {
            return res.status(404).json({ message: "No responses found for this survey." });
        }

        const survey = await Survey.findById(surveyId).exec();
        if (!survey) {
            return res.status(404).json({ message: "Survey not found." });
        }

        const responsesWithQuestions = responses.map(response => {
            const mappedAnswers = response.responses.map(answer => {
                const question = survey.questions.find(q => q._id.equals(answer.questionId));
                return {
                    questionId: answer.questionId,
                    answer: answer.answer,
                    sentiment: answer.sentiment,
                    questionText: question?.questionText || 'Question not found',
                    options: question?.options || [],
                };
            });

            return {
                _id: response._id,
                surveyId: response.surveyId,
                responses: mappedAnswers,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt,
            };
        });

        res.status(200).json({
            status: "success",
            data: responsesWithQuestions,
        });
    } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Server error while fetching responses." });
    }
};
export const getResponsesByOrganisation = async (req, res) => {
    try {
        const { organisationId } = req.params;
        if (!organisationId) {
            return res.status(400).json({ message: "Organisation ID is required." });
        }

        // Find all surveys for the organisation
        const surveys = await Survey.find({ organisationId }).exec();
        if (!surveys || surveys.length === 0) {
            return res.status(404).json({ message: "No surveys found for this organisation." });
        }

        const surveyIds = surveys.map(s => s._id);

        // Find all responses for those surveys
    const responses = await Response.find({ surveyId: { $in: surveyIds } }).exec();

        if (!responses || responses.length === 0) {
            return res.status(404).json({ message: "No responses found for this organisation." });
        }

        // Map responses to include question details from their surveys
        const responsesWithQuestions = responses.map(response => {
            const survey = surveys.find(s => s._id.equals(response.surveyId));
            if (!survey) return null;
            const mappedAnswers = response.responses.map(answer => {
                const question = survey.questions.find(q => q._id.equals(answer.questionId));
                return {
                    questionId: answer.questionId,
                    answer: answer.answer,
                    sentiment: answer.sentiment,
                    questionText: question?.questionText || 'Question not found',
                    options: question?.options || [],
                };
            });
            return {
                _id: response._id,
                surveyId: response.surveyId,
                responses: mappedAnswers,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt,
            };
        });

        // Filter out any null results (where survey was not found)
    const filteredResponses = responsesWithQuestions.filter(r => r !== null);

        res.status(200).json({
            status: "success",
            data: filteredResponses,
        });
    } catch (error) {
    console.error("Error fetching responses by organisation:", error);
    res.status(500).json({ message: "Server error while fetching responses by organisation." });
    }
};

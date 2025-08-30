import connectDB from '../config/db.js';
import Organisation from '../models/Organisation.js';
import User from '../models/User.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Feedback from '../models/Feedback.js';

const showGeneratedData = async () => {
    try {
        console.log('📊 Displaying generated data...\n');
        
        // Connect to database
        await connectDB();
        
        // Get all data
        const organisations = await Organisation.find({});
        const users = await User.find({});
        const surveys = await Survey.find({});
        const responses = await Response.find({});
        const feedbacks = await Feedback.find({});
        
        console.log('🏢 ORGANISATIONS:');
        organisations.forEach((org, index) => {
            console.log(`   ${index + 1}. ${org.organisationName}`);
            console.log(`      Country: ${org.organisationCountry}`);
            console.log(`      Size: ${org.organisationSize}`);
            console.log(`      ID: ${org._id}`);
            console.log('');
        });
        
        console.log('👥 USERS:');
        users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.fullname}`);
            console.log(`      Email: ${user.email}`);
            console.log(`      Role: ${user.role}`);
            console.log(`      Organisation: ${user.organisationId}`);
            console.log(`      Verified: ${user.isVerified}`);
            console.log('');
        });
        
        console.log('📊 SURVEYS:');
        surveys.forEach((survey, index) => {
            console.log(`   ${index + 1}. ${survey.title}`);
            console.log(`      Description: ${survey.description}`);
            console.log(`      Questions: ${survey.questions.length}`);
            console.log(`      Organisation: ${survey.organisationId}`);
            console.log(`      Created by: ${survey.createdBy}`);
            console.log(`      Unique Link: ${survey.uniqueLinkId}`);
            console.log('');
        });
        
        console.log('📝 RESPONSES:');
        responses.forEach((response, index) => {
            console.log(`   ${index + 1}. Survey: ${response.surveyId}`);
            console.log(`      Organisation: ${response.organisationId}`);
            console.log(`      Answer count: ${response.responses.length}`);
            console.log(`      Created: ${response.createdAt}`);
            console.log('');
        });
        
        console.log('💬 FEEDBACKS:');
        feedbacks.forEach((feedback, index) => {
            console.log(`   ${index + 1}. ${feedback.message.substring(0, 50)}...`);
            console.log(`      Category: ${feedback.category}`);
            console.log(`      Sentiment: ${feedback.sentiment}`);
            console.log(`      Organisation: ${feedback.organisationId}`);
            console.log(`      Created: ${feedback.createdAt}`);
            console.log('');
        });
        
        console.log('🔑 TESTING LOGIN CREDENTIALS:');
        console.log('   You can test these endpoints:');
        console.log('');
        console.log('   1. Login with any admin user:');
        console.log('      POST /api/auth/login');
        console.log('      Body: { "email": "admin1@greenearthinitiative.org", "password": "password123" }');
        console.log('');
        console.log('   2. Get surveys for organisation:');
        console.log('      GET /api/surveys');
        console.log('      Headers: Authorization: Bearer <token>');
        console.log('');
        console.log('   3. Get responses for a survey:');
        console.log('      GET /api/responses/survey/:surveyId');
        console.log('      Headers: Authorization: Bearer <token>');
        console.log('');
        console.log('   4. Get feedback for organisation:');
        console.log('      GET /api/feedbacks');
        console.log('      Headers: Authorization: Bearer <token>');
        console.log('');
        console.log('   5. Get dashboard analytics:');
        console.log('      GET /api/dashboard');
        console.log('      Headers: Authorization: Bearer <token>');
        console.log('');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error displaying data:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    showGeneratedData();
}

export default showGeneratedData;

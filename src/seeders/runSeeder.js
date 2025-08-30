#!/usr/bin/env node

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import connectDB from '../config/db.js';
import Organisation from '../models/Organisation.js';
import User from '../models/User.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Feedback from '../models/Feedback.js';

// Dynamic data generation functions
const generateOrganisationName = () => {
    const prefixes = ['Green', 'Blue', 'Red', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Black'];
    const themes = ['Earth', 'Water', 'Air', 'Fire', 'Nature', 'Community', 'Hope', 'Future', 'Peace', 'Justice'];
    const types = ['Initiative', 'Foundation', 'Alliance', 'Network', 'Program', 'Center', 'Project', 'Movement', 'Society', 'Trust'];
    
    return `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(themes)} ${faker.helpers.arrayElement(types)}`;
};

const generateOrganisationCountry = () => {
    const africanCountries = [
        'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Ghana', 'Nigeria', 
        'South Africa', 'Zimbabwe', 'Malawi', 'Zambia', 'Botswana', 'Namibia'
    ];
    return faker.helpers.arrayElement(africanCountries);
};

const generateSurveyTitle = () => {
    const topics = ['Customer Satisfaction', 'Employee Engagement', 'Community Needs', 'Service Quality', 'Impact Measurement', 'Stakeholder Feedback', 'Program Effectiveness', 'User Experience', 'Training Program', 'Resource Utilization'];
    const types = ['Survey', 'Assessment', 'Analysis', 'Evaluation', 'Review', 'Collection', 'Study', 'Report', 'Questionnaire', 'Feedback Form'];
    
    return `${faker.helpers.arrayElement(topics)} ${faker.helpers.arrayElement(types)}`;
};

const generateSurveyDescription = () => {
    const descriptions = [
        'Help us understand your experience and improve our services',
        'Your feedback is crucial for our continuous improvement',
        'We value your opinion to better serve our community',
        'Share your thoughts to help us grow and improve',
        'Your input helps us measure our social impact',
        'Help us understand community needs and priorities',
        'Evaluate the effectiveness of our programs and services',
        'Share your experience to improve user satisfaction',
        'Assess the quality and relevance of our training programs',
        'Help us optimize resource allocation and efficiency'
    ];
    return faker.helpers.arrayElement(descriptions);
};

const generateQuestionText = () => {
    const questionStarts = [
        'How satisfied are you with',
        'What aspects of',
        'How likely are you to',
        'What challenges do you face when',
        'How has',
        'What additional',
        'How would you rate',
        'What motivates you to',
        'How accessible are',
        'What suggestions do you have for'
    ];
    
    const questionEnds = [
        'our services?',
        'our program could be improved?',
        'recommend us to others?',
        'using our services?',
        'our program impacted your life?',
        'services would you like to see?',
        'the quality of our support?',
        'engage with our programs?',
        'our services in your area?',
        'improvement?'
    ];
    
    return `${faker.helpers.arrayElement(questionStarts)} ${faker.helpers.arrayElement(questionEnds)}`;
};

const generateFeedbackMessage = () => {
    const positiveStarts = [
        'The program has been incredibly helpful for our community',
        'Excellent training materials and facilitators',
        'The service quality has improved significantly',
        'The online platform is user-friendly',
        'The impact measurement tools are comprehensive',
        'The partnership approach is working well'
    ];
    
    const constructiveStarts = [
        'Great initiative, but the application process could be simplified',
        'More funding opportunities would be beneficial',
        'Communication could be better',
        'More local language support would be helpful',
        'The services are good but could be more accessible',
        'More resources would help us scale our impact'
    ];
    
    const neutralStarts = [
        'The program meets our basic needs',
        'We appreciate the effort put into this initiative',
        'The services are adequate for our current situation',
        'We see potential for growth and improvement',
        'The program provides a solid foundation',
        'We value the support we receive'
    ];
    
    const allStarts = [...positiveStarts, ...constructiveStarts, ...neutralStarts];
    const start = faker.helpers.arrayElement(allStarts);
    
    // Add some variety with additional context
    const additionalContext = [
        'The staff is very supportive and knowledgeable.',
        'It takes too long to get approved sometimes.',
        'The content is relevant and practical for our needs.',
        'Keep up the good work!',
        'The current resources are limited for our scale.',
        'It makes it easy to access information and resources.',
        'Sometimes we don\'t receive updates about program changes.',
        'It helps us track our progress effectively.',
        'It would help for better community engagement.',
        'It\'s creating sustainable impact in our area.'
    ];
    
    return `${start}. ${faker.helpers.arrayElement(additionalContext)}`;
};

// Simple seeder for quick development setup - generates data dynamically
const runSeeder = async () => {
    try {
        console.log('🌱 Starting dynamic database seeder...');
        
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database');
        
        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Organisation.deleteMany({});
        await User.deleteMany({});
        await Survey.deleteMany({});
        await Response.deleteMany({});
        await Feedback.deleteMany({});
        console.log('✅ Existing data cleared');
        
        // Create 2 organisations dynamically
        console.log('🏢 Creating organisations...');
        const organisations = [];
        
        for (let i = 0; i < 2; i++) {
            organisations.push({
                organisationName: generateOrganisationName(),
                organisationCountry: generateOrganisationCountry(),
                organisationSize: faker.helpers.arrayElement(['small', 'medium', 'large'])
            });
        }
        
        const createdOrganisations = await Organisation.insertMany(organisations);
        console.log(`✅ Created ${createdOrganisations.length} organisations`);
        
        // Create users for each organisation
        console.log('👥 Creating users...');
        const users = [];
        
        // Hash the default password
        const hashedPassword = await bcrypt.hash('password123', 12);
        
        createdOrganisations.forEach((org, index) => {
            // Admin user
            users.push({
                fullname: faker.person.fullName(),
                email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName(), provider: org.organisationName.toLowerCase().replace(/\s+/g, '') + '.org' }),
                phonenumber: `+254${faker.string.numeric(8)}`,
                organisationId: org._id,
                role: 'admin',
                password: hashedPassword,
                isVerified: true
            });
            
            // Analyst user
            users.push({
                fullname: faker.person.fullName(),
                email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName(), provider: org.organisationName.toLowerCase().replace(/\s+/g, '') + '.org' }),
                phonenumber: `+254${faker.string.numeric(8)}`,
                organisationId: org._id,
                role: 'analyst',
                password: hashedPassword,
                isVerified: true
            });
        });
        
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);
        
        // Create surveys for each organisation
        console.log('📊 Creating surveys...');
        const surveys = [];
        
        createdOrganisations.forEach((org, orgIndex) => {
            const adminUser = createdUsers.find(user => 
                user.organisationId.toString() === org._id.toString() && user.role === 'admin'
            );
            
            // Create 1 survey per organisation
            const questions = [];
            const questionCount = faker.number.int({ min: 3, max: 4 });
            
            for (let j = 0; j < questionCount; j++) {
                const questionType = faker.helpers.arrayElement(['text', 'rating', 'choice']);
                const question = {
                    questionText: generateQuestionText(),
                    type: questionType
                };
                
                if (questionType === 'choice') {
                    // Generate dynamic choice options
                    const optionCount = faker.number.int({ min: 3, max: 5 });
                    const options = [];
                    
                    for (let k = 0; k < optionCount; k++) {
                        options.push(faker.lorem.words(faker.number.int({ min: 1, max: 3 })));
                    }
                    
                    question.options = options;
                }
                
                questions.push(question);
            }
            
            surveys.push({
                title: generateSurveyTitle(),
                description: generateSurveyDescription(),
                questions: questions,
                organisationId: org._id,
                createdBy: adminUser._id
            });
        });
        
        const createdSurveys = await Survey.insertMany(surveys);
        console.log(`✅ Created ${createdSurveys.length} surveys`);
        
        // Create responses for each survey
        console.log('📝 Creating responses...');
        const responses = [];
        
        createdSurveys.forEach(survey => {
            const org = createdOrganisations.find(org => 
                org._id.toString() === survey.organisationId.toString()
            );
            
            // Create 3 responses per survey
            for (let i = 0; i < 3; i++) {
                const surveyResponses = survey.questions.map(question => {
                    let answer;
                    let sentiment;
                    
                    switch (question.type) {
                        case 'rating':
                            answer = faker.number.int({ min: 1, max: 5 });
                            sentiment = answer >= 4 ? 'positive' : answer <= 2 ? 'negative' : 'neutral';
                            break;
                        case 'choice':
                            answer = faker.helpers.arrayElement(question.options);
                            sentiment = faker.helpers.arrayElement(['positive', 'negative', 'neutral']);
                            break;
                        case 'text':
                            answer = faker.lorem.sentence();
                            sentiment = faker.helpers.arrayElement(['positive', 'negative', 'neutral']);
                            break;
                    }
                    
                    return {
                        questionId: question._id || faker.database.mongodbObjectId(),
                        answer: answer,
                        sentiment: sentiment
                    };
                });
                
                responses.push({
                    organisationId: org._id,
                    surveyId: survey._id,
                    responses: surveyResponses
                });
            }
        });
        
        const createdResponses = await Response.insertMany(responses);
        console.log(`✅ Created ${createdResponses.length} responses`);
        
        // Create feedback for each organisation
        console.log('💬 Creating feedbacks...');
        const feedbacks = [];
        
        createdOrganisations.forEach(org => {
            // Create 4 feedbacks per organisation
            for (let i = 0; i < 4; i++) {
                feedbacks.push({
                    organisationId: org._id,
                    message: generateFeedbackMessage(),
                    category: faker.helpers.arrayElement(['product', 'ux', 'support', 'pricing', 'features', 'performance', 'other']),
                    sentiment: faker.helpers.arrayElement(['positive', 'negative', 'neutral']),
                    createdAt: faker.date.past({ years: 1 })
                });
            }
        });
        
        const createdFeedbacks = await Feedback.insertMany(feedbacks);
        console.log(`✅ Created ${createdFeedbacks.length} feedbacks`);
        
        console.log('\n🎉 Dynamic database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   • Organisations: ${createdOrganisations.length}`);
        console.log(`   • Users: ${createdUsers.length}`);
        console.log(`   • Surveys: ${createdSurveys.length}`);
        console.log(`   • Responses: ${createdResponses.length}`);
        console.log(`   • Feedbacks: ${createdFeedbacks.length}`);
        
        console.log('\n🔑 Login credentials:');
        createdOrganisations.forEach((org, index) => {
            const adminUser = createdUsers.find(user => 
                user.organisationId.toString() === org._id.toString() && user.role === 'admin'
            );
            console.log(`   • ${org.organisationName}: ${adminUser.email} / password123`);
        });
        
        console.log('\n🚀 All data was generated dynamically using Faker.js!');
        console.log('\n🧪 You can now test your API endpoints with this data!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeder
runSeeder();

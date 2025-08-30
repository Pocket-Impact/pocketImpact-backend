import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import responseRoutes from './routes/responseRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();

// Middleware to enable CORS
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'https://pocket-impact.netlify.app',
        'https://pocket-impact.netlify.app/',
        'https://pocket-impact.netlify.app/*'
    ],
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
console.log("NODE_ENV:", process.env.NODE_ENV);





// Middleware to parse JSON requests
app.use(express.json());
// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));   
// handle cookies
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/', (req, res) => {
    res.json(
        {
            "status": "success",
            "message": "Welcome to PocketImpact API! 🚀",
            "version": "1.0.0"
        }
    )
})
export default app;
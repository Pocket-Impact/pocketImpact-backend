import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import responseRoutes from './routes/responseRoutes.js';
import surverRoutes from './routes/surveyRoutes.js';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();

// Middleware to enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies to be sent with requests
}));



// Middleware to parse JSON requests
app.use(express.json());
// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));   
// handle cookies
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surverRoutes);
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
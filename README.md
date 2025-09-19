# Pocket Impact Backend API

A comprehensive Node.js/Express REST API for managing users, organisations, surveys, responses, and feedback with authentication and role-based access control. Built with MongoDB for data storage and includes advanced sentiment analysis capabilities.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user lifecycle management with email verification
- **Survey System**: Create, manage, and distribute surveys with unique links
- **Response Collection**: Collect and analyze survey responses with sentiment analysis
- **Feedback System**: Comprehensive feedback collection with automated sentiment analysis
- **Dashboard Analytics**: Real-time analytics and insights
- **Reports Engine**: Advanced reporting with executive summaries
- **Data Seeding**: Comprehensive fake data generation for development/testing

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi schemas
- **Email**: SendGrid integration
- **Testing**: Jest with comprehensive test coverage
- **AI**: Sentiment analysis with @xenova/transformers

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (Atlas cloud or local instance)
- SendGrid account with verified sender email
- npm (comes with Node.js)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Pocket-Impact/pocket-impact.git
cd pocket-impact
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@email.com
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-url.com/api`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Available Endpoints

#### Authentication (`/api/auth`)
- `POST /signup` - Register new organisation and admin user
- `POST /login` - User login (returns JWT tokens as cookies)
- `GET /logout` - User logout (clears cookies)
- `POST /refresh-token` - Refresh access token
- `GET /check` - Verify token and get user info
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-otp` - Verify email with OTP
- `GET /resend-otp` - Resend OTP to email

#### User Management (`/api/users`)
- `POST /add-user` - Add user to organisation (Admin only)
- `GET /all-users` - Get all users in organisation (Admin only)
- `PUT /update-user` - Update user details (Admin only)
- `DELETE /delete-user/:id` - Delete user (Admin only)

#### Survey Management (`/api/surveys`)
- `POST /` - Create new survey (Admin/Analyst only)
- `GET /` - Get all surveys for organisation
- `PUT /:surveyId` - Update survey (Admin/Analyst only)
- `DELETE /:surveyId` - Delete survey (Admin/Analyst only)
- `POST /send-survey-link` - Send survey via email (Admin/Analyst only)
- `GET /unique/:uniqueLinkId` - Get survey by unique link (Public)

#### Response Management (`/api/responses`)
- `POST /` - Submit survey response (Public)
- `GET /organisation/` - Get responses by organisation (Protected)
- `GET /survey/:surveyId` - Get responses by survey ID (Protected)
- `POST /analyze-sentiment/:surveyId` - Analyze response sentiment (Admin only)

#### Feedback Management (`/api/feedbacks`)
- `POST /` - Submit feedback (Public)
- `GET /` - Get feedback by organisation (Protected)
- `DELETE /:id` - Delete feedback (Admin only)
- `POST /analyze-sentiment` - Analyze feedback sentiment (Admin only)

#### Dashboard (`/api/dashboard`)
- `GET /` - Get dashboard analytics data (Protected)
- `GET /organisation` - Get organisation information (Protected)
- `GET /daily-categories` - Get daily categories data (Protected)

#### Reports (`/api/reports`)
- `GET /surveys` - Get survey reports (Admin/Analyst only)
- `GET /responses` - Get response reports (Admin/Analyst only)
- `GET /feedback` - Get feedback reports (Admin/Analyst only)
- `GET /users` - Get user activity reports (Admin only)
- `GET /executive-summary` - Get executive summary (Admin only)
- `GET /health` - Health check (Public)

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests by module
npm run test:core
npm run test:dashboard
npm run test:surveys
npm run test:feedback
npm run test:reports
npm run test:shared
```

## 🌱 Database Seeding

Generate realistic test data:

```bash
# Quick setup (minimal data)
npm run seed

# Development setup (medium data)
npm run seed:dev

# Full production-like setup (comprehensive data)
npm run seed:full

# View generated data
npm run show:data
```

## 📖 Detailed Documentation

- [Complete API Documentation](docs/api-docs.md) - Comprehensive API reference
- [Quick Reference Guide](docs/API_QUICK_REFERENCE.md) - Quick endpoint reference
- [Reports Documentation](docs/REPORTS_README.md) - Advanced reporting features
- [Seeder Guide](docs/SEEDER_GUIDE.md) - Database seeding instructions
- [Setup Guide](docs/README.md) - Detailed setup instructions

## 🔧 Development

### Project Structure

```
src/
├── core/                 # Core functionality
│   ├── controllers/      # Auth & user controllers
│   ├── models/          # User & organisation models
│   ├── routes/          # Auth & user routes
│   ├── schemas/         # Validation schemas
│   └── tests/           # Core tests
├── surveys/             # Survey functionality
│   ├── controllers/     # Survey & response controllers
│   ├── models/          # Survey & response models
│   ├── routes/          # Survey & response routes
│   ├── schemas/         # Survey validation schemas
│   └── tests/           # Survey tests
├── feedback/            # Feedback functionality
│   ├── controllers/     # Feedback controllers
│   ├── models/          # Feedback models
│   ├── routes/          # Feedback routes
│   ├── schemas/         # Feedback validation schemas
│   └── tests/           # Feedback tests
├── dashboard/           # Dashboard functionality
│   ├── controllers/     # Dashboard controllers
│   ├── routes/          # Dashboard routes
│   └── tests/           # Dashboard tests
├── reports/             # Reports functionality
│   ├── controllers/     # Reports controllers
│   ├── routes/          # Reports routes
│   ├── schemas/         # Reports validation schemas
│   └── tests/           # Reports tests
├── shared/              # Shared utilities
│   ├── config/          # Database configuration
│   ├── middlewares/     # Authentication & validation
│   ├── utils/           # Utility functions
│   └── seeders/         # Database seeders
├── app.js               # Express app configuration
└── server.js            # Server entry point
```

### Key Features

- **Modular Architecture**: Clean separation of concerns
- **Role-Based Access**: Admin, Analyst, Researcher roles
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive Joi schema validation
- **Error Handling**: Standardized error responses
- **CORS Support**: Configurable cross-origin resource sharing
- **Cookie Management**: HTTP-only cookies for security
- **Sentiment Analysis**: AI-powered sentiment analysis
- **Email Integration**: SendGrid for transactional emails
- **Database Seeding**: Realistic test data generation

## 🔒 Security

- JWT-based authentication with refresh tokens
- HTTP-only cookies for token storage
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Password hashing with bcrypt
- Email verification system

## 🚀 Deployment

1. Set up production environment variables
2. Configure MongoDB Atlas or production database
3. Set up SendGrid with verified sender
4. Deploy to your preferred platform (Heroku, AWS, etc.)
5. Update CORS origins for production domain

## 📝 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.

---

**Pocket Impact** - AI-Powered Tools to Supercharge Your Social Impact 🚀

# Pocket Impact Documentation Index

Welcome to the Pocket Impact Backend API documentation! This index will help you navigate through all available documentation.

## 📚 Documentation Overview

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview, quick start, and basic setup
- **[Setup Guide](README.md)** - Detailed local development setup instructions

### 📖 API Documentation
- **[Complete API Docs](api-docs.md)** - Comprehensive API reference with all endpoints
- **[Quick Reference](API_QUICK_REFERENCE.md)** - Fast endpoint lookup for developers
- **[Reports Documentation](REPORTS_README.md)** - Advanced analytics and reporting features

### 🛠️ Development Tools
- **[Seeder Guide](SEEDER_GUIDE.md)** - Database seeding for development and testing
- **[Database Structure](structure.tldr)** - Visual database schema (TLDraw format)

## 🎯 Quick Navigation

### For New Developers
1. Start with [Main README](../README.md) for project overview
2. Follow [Setup Guide](README.md) for local development
3. Use [Quick Reference](API_QUICK_REFERENCE.md) for API endpoints
4. Check [Seeder Guide](SEEDER_GUIDE.md) for test data

### For API Integration
1. Review [Complete API Docs](api-docs.md) for detailed specifications
2. Use [Quick Reference](API_QUICK_REFERENCE.md) for common endpoints
3. Check [Reports Documentation](REPORTS_README.md) for analytics features

### For Advanced Features
1. Explore [Reports Documentation](REPORTS_README.md) for analytics
2. Review [Complete API Docs](api-docs.md) for advanced endpoints
3. Check [Database Structure](structure.tldr) for data relationships

## 🔧 Development Workflow

### 1. Setup
```bash
# Clone and install
git clone https://github.com/Pocket-Impact/pocket-impact.git
cd pocket-impact
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

### 2. Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:core
npm run test:surveys
npm run test:feedback
npm run test:reports
npm run test:dashboard
npm run test:shared
```

### 3. Database Seeding
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

## 📋 API Endpoints Summary

### Authentication (`/api/auth`)
- Signup, Login, Logout
- Password reset, OTP verification
- Token refresh, Auth status check

### User Management (`/api/users`)
- Add, update, delete users
- Get all users in organisation
- Role-based access control

### Survey Management (`/api/surveys`)
- Create, read, update, delete surveys
- Send surveys via email
- Public survey access via unique links

### Response Management (`/api/responses`)
- Submit survey responses
- Get responses by survey/organisation
- Sentiment analysis

### Feedback Management (`/api/feedbacks`)
- Submit and manage feedback
- Sentiment analysis
- Category-based organization

### Dashboard (`/api/dashboard`)
- Analytics data
- Organisation information
- Daily categories data

### Reports (`/api/reports`)
- Survey, response, feedback reports
- User activity reports
- Executive summaries
- Health checks

## 🏗️ Project Structure

```
src/
├── core/           # Authentication & user management
├── surveys/        # Survey & response functionality
├── feedback/       # Feedback collection & analysis
├── dashboard/      # Analytics dashboard
├── reports/        # Advanced reporting
├── shared/         # Common utilities & configurations
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Admin, Analyst, Researcher)
- HTTP-only cookies for token storage
- Input validation with Joi schemas
- CORS configuration
- Password hashing with bcrypt

## 🚀 Deployment

1. Set up production environment variables
2. Configure MongoDB Atlas
3. Set up SendGrid with verified sender
4. Deploy to your preferred platform
5. Update CORS origins for production

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Pocket-Impact/pocket-impact/issues)
- **Documentation**: This documentation index
- **API Reference**: [Complete API Docs](api-docs.md)

---

**Need help?** Start with the [Main README](../README.md) or [Quick Reference](API_QUICK_REFERENCE.md) for immediate assistance.

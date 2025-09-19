# 🎯 Pocket Impact - Fake Data Seeder Guide

Your Pocket Impact backend is now equipped with comprehensive fake data seeders that generate realistic, interconnected data for testing and development!

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Set Up Environment**
Make sure you have a `.env` file with your MongoDB connection string:
```env
DATABASE_URL=mongodb://localhost:27017/pocket-impact
# or
MONGO_URI=mongodb://localhost:27017/pocket-impact
```

### 3. **Seed Your Database**
```bash
# Quick setup (recommended for initial testing)
npm run seed

# Development setup (more data)
npm run seed:dev

# Full production-like setup (lots of data)
npm run seed:full
```

## 📊 What Gets Generated

### **Quick Seeder** (`npm run seed`)
- **2 Organisations** with realistic NGO names
- **4 Users** (2 admin + 2 analyst)
- **2 Surveys** with different question types
- **6 Responses** with sentiment analysis
- **8 Feedbacks** across different categories

### **Development Seeder** (`npm run seed:dev`)
- **3 Organisations** in different African countries
- **9 Users** (3 admin + 3 analyst + 3 researcher)
- **6 Surveys** with varied questions
- **30 Responses** for comprehensive testing
- **24 Feedbacks** with different sentiments

### **Full Production Seeder** (`npm run seed:full`)
- **10 Organisations** with diverse names and locations
- **50 Users** across all roles
- **30 Surveys** with realistic content
- **450 Responses** for extensive testing
- **200 Feedbacks** covering all categories

## 🔑 Login Credentials

After seeding, you can log in with these accounts:

```
Green Earth Initiative: admin1@greenearthinitiative.org / password123
TechWise Solutions: admin2@techwisesolutions.org / password123
Hope Foundation: admin3@hopefoundation.org / password123
```

## 🧪 Testing Your API

### **1. Login to Get Cookies**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@greenearthinitiative.org",
    "password": "password123"
  }' \
  -c cookies.txt
```

### **2. Test Protected Endpoints**
```bash
# Get surveys (use cookies from login)
curl -X GET http://localhost:3000/api/surveys \
  -b cookies.txt

# Get responses for a survey
curl -X GET http://localhost:3000/api/responses/survey/SURVEY_ID \
  -b cookies.txt

# Get feedback
curl -X GET http://localhost:3000/api/feedbacks \
  -b cookies.txt

# Get dashboard analytics
curl -X GET http://localhost:3000/api/dashboard \
  -b cookies.txt
```

## 📁 Seeder Files Structure

```
src/seeders/
├── runSeeder.js          # Quick seeder (npm run seed)
├── devSeeder.js          # Development seeder (npm run seed:dev)
├── fakeDataSeeder.js     # Full production seeder (npm run seed:full)
├── showData.js           # Display generated data (npm run show:data)
├── testConnection.js     # Test database connection
└── README.md             # Detailed documentation
```

## 🔄 Available Commands

```bash
# Seed database with minimal data
npm run seed

# Seed database with development data
npm run seed:dev

# Seed database with full production data
npm run seed:full

# Show generated data
npm run show:data

# Test database connection
node src/seeders/testConnection.js
```

## 🌍 Generated Data Features

### **Organisations**
- Realistic NGO names (Green Earth Initiative, TechWise Solutions, etc.)
- African countries (Kenya, Uganda, Tanzania, Rwanda, etc.)
- Various sizes (small, medium, large)

### **Users**
- **Admin**: Full access to all features
- **Analyst**: Can create surveys and view responses
- **Researcher**: Can view data and generate reports
- All users are pre-verified with `password123`

### **Surveys**
- **Question Types**: Rating (1-5), Text, Choice (multiple choice)
- **Realistic Titles**: Customer satisfaction, employee engagement, etc.
- **Proper Validation**: All required fields populated

### **Responses**
- **Sentiment Analysis**: Pre-analyzed (positive/negative/neutral)
- **Realistic Answers**: Contextual responses based on question type
- **Proper Relationships**: Linked to surveys and organisations

### **Feedbacks**
- **Categories**: Product, UX, Support, Pricing, Features, Performance, Other
- **Sentiment**: Pre-analyzed feedback
- **Realistic Messages**: Contextual feedback about NGO programs

## 🔗 Data Relationships

The seeders maintain proper relationships:
- Users belong to organisations
- Surveys are created by admin users within organisations
- Responses are linked to surveys and organisations
- Feedbacks are linked to organisations
- All foreign keys are properly maintained

## 🛠️ Customization

You can modify the seeder files to:
- Change the number of records generated
- Modify question types and content
- Adjust feedback categories and messages
- Change organisation names and countries
- Customize user roles and permissions

## 🚨 Troubleshooting

### **Database Connection Issues**
```bash
# Test connection
node src/seeders/testConnection.js

# Check your .env file
# Ensure MongoDB is running
# Verify connection string format
```

### **Permission Issues**
- Ensure you have write access to the database
- Check if the database exists
- Verify MongoDB user permissions

### **Validation Errors**
- The seeders include proper validation
- All required fields are populated
- Data types match schema requirements

## 📈 Testing Scenarios

### **1. Authentication Flow**
- Login with different user roles
- Test token refresh
- Verify logout clears cookies

### **2. Survey Management**
- Create new surveys
- View existing surveys
- Update survey questions
- Delete surveys

### **3. Response Analysis**
- Submit survey responses
- View response analytics
- Test sentiment analysis
- Export response data

### **4. Feedback System**
- Submit general feedback
- Categorize feedback
- Analyze feedback sentiment
- Generate feedback reports

### **5. Dashboard Analytics**
- View organisation statistics
- Monitor survey performance
- Track feedback trends
- Generate impact reports

## 🎉 Success Indicators

When seeding is successful, you'll see:
```
🎉 Database seeding completed successfully!

📊 Summary:
   • Organisations: 2
   • Users: 4
   • Surveys: 2
   • Responses: 6
   • Feedbacks: 8

🔑 Login credentials:
   • Green Earth Initiative: admin1@greenearthinitiative.org / password123
   • TechWise Solutions: admin2@techwisesolutions.org / password123

🚀 You can now test your API endpoints with this data!
```

## 🔄 Resetting Data

To clear all data and start fresh:
```bash
# The seeders automatically clear existing data
npm run seed
```

## 📚 Next Steps

1. **Test Authentication**: Try logging in with the generated credentials
2. **Explore Data**: Use the API endpoints to view the generated data
3. **Test Features**: Verify all your API functionality works with the fake data
4. **Customize**: Modify the seeders to match your specific testing needs
5. **Deploy**: Use the seeders in your production environment for testing

## 🆘 Need Help?

If you encounter issues:
1. Check the console output for error messages
2. Verify your database connection
3. Ensure all models are properly imported
4. Check your environment variables
5. Review the seeder README files

---

**Happy Testing! 🚀**

Your Pocket Impact backend is now ready with realistic, interconnected data that will make development and testing much more enjoyable!

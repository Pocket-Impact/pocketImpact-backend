# Database Seeders

This directory contains scripts to populate your Pocket Impact database with fake data for development and testing purposes.

## Available Seeders

### 1. **Quick Seeder** (`runSeeder.js`)
**Command:** `npm run seed`

Generates a minimal dataset perfect for quick testing:
- **2 Organisations** (Green Earth Initiative, TechWise Solutions)
- **4 Users** (2 admin + 2 analyst users)
- **2 Surveys** (1 per organisation)
- **6 Responses** (3 per survey)
- **8 Feedbacks** (4 per organisation)

### 2. **Development Seeder** (`devSeeder.js`)
**Command:** `npm run seed:dev`

Generates a medium-sized dataset for development:
- **3 Organisations** (Green Earth Initiative, TechWise Solutions, Hope Foundation)
- **9 Users** (3 admin + 3 analyst + 3 researcher users)
- **6 Surveys** (2 per organisation)
- **30 Responses** (5 per survey)
- **24 Feedbacks** (8 per organisation)

### 3. **Full Production Seeder** (`fakeDataSeeder.js`)
**Command:** `npm run seed:full`

Generates a comprehensive dataset for production-like testing:
- **10 Organisations** with realistic names and locations
- **50 Users** (10 admin + 40 other roles)
- **30 Surveys** (3 per organisation)
- **450 Responses** (15 per survey)
- **200 Feedbacks** (20 per organisation)

## Usage

### Prerequisites
1. Make sure your MongoDB is running
2. Set up your environment variables (`.env` file)
3. Install dependencies: `npm install`

### Running Seeders

```bash
# Quick setup (recommended for initial testing)
npm run seed

# Development setup (recommended for development)
npm run seed:dev

# Full production-like setup
npm run seed:full
```

### Manual Execution

You can also run the seeders directly:

```bash
# Quick seeder
node src/seeders/runSeeder.js

# Development seeder
node src/seeders/devSeeder.js

# Full seeder
node src/seeders/fakeDataSeeder.js
```

## Generated Data Structure

### Organisations
- Realistic NGO names
- African countries (Kenya, Uganda, Tanzania, etc.)
- Various sizes (small, medium, large)

### Users
- **Admin users**: Can manage all aspects of the organisation
- **Analyst users**: Can create surveys and view responses
- **Researcher users**: Can view data and generate reports
- **Default password**: `password123` for all users
- **Verified accounts**: All users are pre-verified

### Surveys
- **Question types**: Rating (1-5), Text, Choice (multiple choice)
- **Realistic titles**: Customer satisfaction, employee engagement, etc.
- **Proper validation**: All surveys have required fields

### Responses
- **Sentiment analysis**: Pre-analyzed with positive/negative/neutral
- **Realistic answers**: Contextual responses based on question type
- **Proper relationships**: Linked to surveys and organisations

### Feedbacks
- **Categories**: Product, UX, Support, Pricing, Features, Performance, Other
- **Sentiment**: Pre-analyzed feedback
- **Realistic messages**: Contextual feedback about NGO programs

## Login Credentials

After seeding, you can log in with any admin user:

```
Green Earth Initiative: admin1@greenearthinitiative.org / password123
TechWise Solutions: admin2@techwisesolutions.org / password123
Hope Foundation: admin3@hopefoundation.org / password123
```

## Data Relationships

The seeders maintain proper relationships:
- Users belong to organisations
- Surveys are created by admin users within organisations
- Responses are linked to surveys and organisations
- Feedbacks are linked to organisations
- All foreign keys are properly maintained

## Customization

You can modify the seeder files to:
- Change the number of records generated
- Modify the types of questions
- Adjust the feedback categories
- Change the organisation names and countries
- Customize the user roles and permissions

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your MongoDB connection string
   - Ensure MongoDB is running
   - Verify your `.env` file configuration

2. **Permission Errors**
   - Ensure you have write access to the database
   - Check if the database exists

3. **Validation Errors**
   - The seeders include proper validation
   - All required fields are populated
   - Data types match the schema requirements

### Resetting Data

To clear all data and start fresh:

```bash
# The seeders automatically clear existing data
npm run seed
```

## Notes

- **Data is realistic**: All generated data follows realistic patterns
- **Relationships maintained**: All foreign key relationships are properly set
- **No duplicate emails**: Each user has a unique email address
- **Proper validation**: All data passes schema validation
- **Sentiment analysis**: Responses include pre-analyzed sentiment scores

## Support

If you encounter issues with the seeders:
1. Check the console output for error messages
2. Verify your database connection
3. Ensure all models are properly imported
4. Check that your environment variables are set correctly

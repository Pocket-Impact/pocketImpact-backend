# Pocket Impact Backend API Documentation

## Overview

The backend is a Node.js/Express REST API for managing users and organisations, with authentication and role-based access control. It uses MongoDB for data storage.

---


## Table of Contents

1. **Authentication**

# Pocket Impact Backend API Documentation

## Overview

The backend is a Node.js/Express REST API for managing users, organisations, surveys, and feedback, with authentication and role-based access control. It uses MongoDB for data storage.

---

## Table of Contents

1. **Authentication**
   - Signup (`POST /api/auth/signup`)
   - Login (`POST /api/auth/login`)
   - Refresh Token (`POST /api/auth/refresh-token`)
   - Verify OTP (`POST /api/auth/verify-otp`)
   - Resend OTP (`GET /api/auth/resend-otp`)
   - Forgot Password (`POST /api/auth/forgot-password`)
   - Reset Password (`POST /api/auth/reset-password`)
   - Change Password (`POST /api/auth/change-password`)
   - Logout (`POST /api/auth/logout`)
2. **User Management**
   - Add User to Organisation (`POST /api/users/add-user`)
   - Get All Users in Organisation (`GET /api/users/all-users`)
3. **Survey & Feedback**
   - Create Survey (`POST /api/surveys`)
   - Get Surveys (`GET /api/surveys/:organisationId`)
   - Update Survey (`PUT /api/surveys/:surveyId`)
   - Delete Survey (`DELETE /api/surveys/:surveyId`)
   - Send Survey Link (`POST /api/surveys/send-survey-link`)
   - Get Survey by Unique Link (`GET /api/surveys/unique/:uniqueLinkId`)
   - Submit Feedback (`POST /api/feedback`)
   - Get Feedback by Survey (`GET /api/feedback/:surveyId`)
4. **Middleware**
   - Authentication (`protect`)
   - Role Restriction (`restrictTo`)
   - Verified User (`requireVerifiedUser`)
5. **Models**
   - User
   - Organisation
   - Survey
   - Feedback
6. **Utilities**
   - generateOtp
   - sendEmail
   - generatePassword
   - generateTokens
7. **Database Connection**

---

## 1. Authentication

### Signup
**Endpoint:** `POST /api/auth/signup`
**Description:** Register a new organisation and admin user. Sends an OTP to the provided email for verification.
**Request Body:**
```json
{
  "fullname": "Jane Doe",
  "email": "jane@example.com",
  "phonenumber": "+1234567890",
  "organisationName": "Acme Corp",
  "organisationCountry": "USA",
  "organisationSize": "medium",
  "password": "securePassword123"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "Jane Doe",
      "email": "jane@example.com",
      "role": "admin"
    }
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "All fields are required"
}
```
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Login
**Endpoint:** `POST /api/auth/login`
**Description:** Login with email and password. Returns access and refresh tokens.
**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "Jane Doe",
      "email": "jane@example.com",
      "role": "admin"
    }
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Email and password are required"
}
```
`200 OK`, `400 Bad Request`

### Refresh Token
- **Endpoint:** `POST /api/auth/refresh-token`
- **Description:** Use a valid refresh token to obtain a new access token.
- **Request Body:** `refreshToken` (cookie or body)
- **Responses:** `200 OK`, `401 Unauthorized`

### Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`
**Description:** Verify the OTP sent to the user's email.
**Request Body:**
```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Account verified successfully",
  "data": {
    "user": {
      "id": "userId",
      "email": "jane@example.com",
      "isVerified": true
    }
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Invalid OTP"
}
```
`200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Resend OTP
**Endpoint:** `GET /api/auth/resend-otp`
**Description:** Resend a new OTP to the user's email.
**Success Response:**
```json
{
  "status": "success",
  "message": "New OTP sent to your email",
  "data": {
    "email": "jane@example.com"
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "User not found"
}
```
`200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`
**Description:** Request a password reset link.
**Request Body:**
```json
{
  "email": "jane@example.com"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Password reset link sent to your email."
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "No account found with that email address."
}
```
`200 OK`, `404 Not Found`, `500 Internal Server Error`

### Reset Password
**Endpoint:** `POST /api/auth/reset-password`
**Description:** Reset password using the token sent to email.
**Request Body:**
```json
{
  "token": "abcdef123456",
  "newPassword": "newSecurePassword456"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Password has been reset successfully."
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Invalid or expired password reset token."
}
```
`200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Change Password
**Endpoint:** `POST /api/auth/change-password`
**Description:** Change password for a logged-in user.
**Request Body:**
```json
{
  "oldPassword": "securePassword123",
  "newPassword": "newSecurePassword456"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Incorrect current password"
}
```
`200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Logout
- **Endpoint:** `POST /api/auth/logout`
- **Description:** Log out the current user (clears JWT cookies).
- **Responses:** `200 OK`

---

## 2. User Management

### Add User to Organisation
**Endpoint:** `POST /api/users/add-user`
**Description:** Add a user to the current organisation (admin only). Sends a randomly generated password to the user's email.
**Request Body:**
```json
{
  "fullname": "John Smith",
  "phonenumber": "+1234567890",
  "email": "john@example.com",
  "role": "analyst"
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "We sent a verification code on john@example.com please check it before it expires",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "John Smith",
      "email": "john@example.com",
      "role": "analyst"
    }
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Email already exists"
}
```
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get All Users in Organisation
- **Endpoint:** `GET /api/users/all-users`
- **Description:** Get all users in the current organisation (admin only).
- **Responses:** `200 OK`, `500 Internal Server Error`

---

## 3. Survey & Feedback

### Create Survey
**Endpoint:** `POST /api/surveys`
**Description:** Create a new survey for an organisation.
**Request Body:**
```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Monthly feedback survey",
  "questions": [
    {
      "questionText": "How satisfied are you with our service?",
      "type": "rating"
    },
    {
      "questionText": "What can we improve?",
      "type": "text"
    }
  ]
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Survey created successfully.",
  "data": {
    "survey": {
      "id": "surveyId",
      "title": "Customer Satisfaction Survey",
      "description": "Monthly feedback survey",
      "questions": [ ... ]
    }
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Title, questions, organisation, and createdBy are required."
}
```
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Surveys
- **Endpoint:** `GET /api/surveys/:organisationId`
- **Description:** Get all surveys for the current organisation.
- **Responses:** `200 OK`, `500 Internal Server Error`

### Update Survey
- **Endpoint:** `PUT /api/surveys/:surveyId`
- **Description:** Update a survey by ID.
- **Request Body:** `title`, `description`, `questions`
- **Responses:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Delete Survey
- **Endpoint:** `DELETE /api/surveys/:surveyId`
- **Description:** Delete a survey by ID.
- **Responses:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Send Survey Link
- **Endpoint:** `POST /api/surveys/send-survey-link`
- **Description:** Send survey link via email to multiple recipients.
- **Request Body:** `surveyId`, `emails`
- **Responses:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Get Survey by Unique Link
- **Endpoint:** `GET /api/surveys/unique/:uniqueLinkId`
- **Description:** Get a survey by its unique link ID.
- **Responses:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Submit Feedback
**Endpoint:** `POST /api/feedback`
**Description:** Submit feedback for a survey.
**Request Body:**
```json
{
  "surveyId": "survey123",
  "feedbacks": [
    { "questionId": "q1", "answer": "Very satisfied" },
    { "questionId": "q2", "answer": "More vegan options" }
  ]
}
```
**Success Response:**
```json
{
  "status": "success",
  "message": "Feedback submitted successfully.",
  "data": {
    "feedback": {
      "id": "feedbackId",
      "survey": "survey123",
      "feedbacks": [ ... ]
    }
  }
}
```
**Error Response:**
```json
{
  "status": "fail",
  "message": "Survey ID and feedback are required."
}
```
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Feedback by Survey
- **Endpoint:** `GET /api/feedback/:surveyId`
- **Description:** Get all feedback for a specific survey.
- **Responses:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

---

## 4. Middleware

- **protect:** Checks for JWT in cookies, verifies token, attaches user info to `req.user`.
- **restrictTo(...roles):** Restricts access to users with specified roles.
- **requireVerifiedUser:** Ensures the user is verified before allowing access to certain routes.

---

## 5. Models

### User
- `fullname` (string, required)
- `email` (string, required, unique, validated)
- `phonenumber` (string, required, validated)
- `organisation` (ObjectId, ref: Organisation, required)
- `role` (string: 'analyst' | 'researcher' | 'admin', required)
- `password` (string, required, hashed)
- `isVerified` (boolean, default: false)
- `otp` (string)
- `otpExpires` (Date)
- `resetPasswordToken` (string)
- `resetPasswordExpires` (Date)

### Organisation
- `organisationName` (string, required, unique)
- `organisationCountry` (string, required)
- `organisationSize` (string: 'small' | 'medium' | 'large', required)

### Survey
- `title` (string, required)
- `description` (string, optional)
- `questions` (array, required)
- `uniqueLinkId` (string, required, unique)
- `organisation` (ObjectId, ref: Organisation, required)
- `createdBy` (ObjectId, ref: User, required)

### Feedback
- `survey` (ObjectId, ref: Survey, required)
- `feedbacks` (array, required)

---

## 6. Utilities

- **generateOtp:** Generates a 6-digit OTP and expiration time (10 minutes from now).
- **sendEmail:** Sends an email using SendGrid (for OTPs, notifications, survey links).
- **generatePassword:** Generates a 12-character password for new users.
- **generateTokens:** Generates access and refresh JWT tokens for authentication.

---

## 7. Database Connection

- MongoDB connection via Mongoose.
- URI from `MONGO_URI` env variable or defaults to `mongodb://localhost:27017/pocket-impact`.

---

- Generates access and refresh JWT tokens for authentication.

---
## 7. Database Connection

- MongoDB connection via Mongoose.
- URI from `MONGO_URI` env variable or defaults to `mongodb://localhost:27017/pocket-impact`.

--
# Pocket Impact Backend API Documentation

## Overview

The backend is a Node.js/Express REST API for managing users and organisations, with authentication and role-based access control. It uses MongoDB for data storage.

---

## Table of Contents

1. **Authentication**
   - Signup (`POST /api/auth/signup`)
   - Login (`POST /api/auth/login`)
2. **User Management**
   - Add User to Organisation (`POST /api/users/add-user`)
   - Get All Users in Organisation (`GET /api/users/all-users`)
3. **Middleware**
   - Authentication (`protect`)
   - Role Restriction (`restrictTo`)
4. **Models**
   - User
   - Organisation
5. **Database Connection**

---


## 1. Authentication

### Signup

- **Endpoint:** `POST /api/auth/signup`
- **Description:** Register a new organisation and admin user. Sends an OTP to the provided email for verification.
- **Request Body:**
  - `fullname` (string, required)
  - `email` (string, required)
  - `phonenumber` (string, required)
  - `organisationName` (string, required)
  - `organisationCountry` (string, required)
  - `organisationSize` (string: 'small' | 'medium' | 'large', required)
  - `password` (string, required)
- **Responses:**
  - `201 Created`: User created successfully, OTP sent to email.
  - `400 Bad Request`: Missing fields, organisation or email already exists.
  - `500 Internal Server Error`: Server error.


### Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Login with email and password. Only verified users can log in.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Responses:**
  - `200 OK`: Login successful, JWT cookie set.
  - `400 Bad Request`: Invalid credentials or user not verified.

### Verify OTP

- **Endpoint:** `POST /api/auth/verify-otp`
- **Description:** Verify the OTP sent to the user's email to activate the account.
- **Middleware:** `protect`
- **Request Body:**
  - `email` (string, required)
  - `otp` (string, required)
- **Responses:**
  - `200 OK`: Account verified successfully.
  - `400 Bad Request`: Invalid or expired OTP, already verified.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

### Resend OTP

- **Endpoint:** `GET /api/auth/resend-otp`
- **Description:** Resend a new OTP to the user's email if not yet verified.
- **Middleware:** `protect`
- **Responses:**
  - `200 OK`: New OTP sent to your email.
  - `400 Bad Request`: User already verified.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

### Forgot Password

- **Endpoint:** `POST /api/auth/forgot-password`
- **Description:** Request a password reset link to be sent to the user's email.
- **Request Body:**
  - `email` (string, required)
- **Responses:**
  - `200 OK`: Password reset link sent to your email.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

### Reset Password

- **Endpoint:** `POST /api/auth/reset-password`
- **Description:** Reset password using the token sent to email.
- **Request Body:**
  - `token` (string, required)
  - `newPassword` (string, required)
- **Responses:**
  - `200 OK`: Password has been reset successfully.
  - `400 Bad Request`: Invalid or expired token.
  - `500 Internal Server Error`: Server error.

### Change Password

- **Endpoint:** `POST /api/auth/change-password`
- **Description:** Change password for a logged-in user.
- **Middleware:** `protect`
- **Request Body:**
  - `oldPassword` (string, required)
  - `newPassword` (string, required)
- **Responses:**
  - `200 OK`: Password changed successfully.
  - `400 Bad Request`: Incorrect current password or missing fields.
  - `500 Internal Server Error`: Server error.

### Logout

- **Endpoint:** `POST /api/auth/logout`
- **Description:** Log out the current user (clears JWT cookie).
- **Responses:**
  - `200 OK`: Logout successful.

---

## 2. User Management

### Add User to Organisation

- **Endpoint:** `POST /api/users/add-user`
- **Description:** Add a user to the current organisation (admin only).
- **Middleware:** `protect`, `restrictTo('admin')`
- **Request Body:**
  - `fullname` (string, required)
  - `phonenumber` (string, required)
  - `email` (string, required)
  - `role` (string: 'analyst' | 'researcher' | 'admin', required)
- **Responses:**
  - `201 Created`: User added successfully.
  - `400 Bad Request`: Missing fields or email exists.
  - `500 Internal Server Error`: Server error.

### Get All Users in Organisation

- **Endpoint:** `GET /api/users/all-users`
- **Description:** Get all users in the current organisation (admin only).
- **Middleware:** `protect`, `restrictTo('admin')`
- **Responses:**
  - `200 OK`: List of users.
  - `500 Internal Server Error`: Server error.

---

## 3. Middleware

### protect

- Checks for JWT in cookies.
- Verifies token and attaches user info to `req.user`.
- Returns `401 Unauthorized` if invalid or missing.

### restrictTo(...roles)

- Restricts access to users with specified roles.
- Returns `403 Forbidden` if user role is not allowed.

### requireVerifiedUser

- Ensures the user is verified before allowing access to certain routes.
- Returns `403 Forbidden` if user is not verified.

---

## 4. Models

### Organisation

- `organisationName` (string, required, unique): Name of the organisation.
- `organisationCountry` (string, required): Country where the organisation is based.
- `organisationSize` (string: 'small' | 'medium' | 'large', required): Size of the organisation.

### User

- `fullname` (string, required): Full name of the user.
- `email` (string, required, unique, validated): User's email address.
- `phonenumber` (string, required, validated): User's phone number.
- `organisation` (ObjectId, ref: Organisation, required): Reference to the organisation.
- `role` (string: 'analyst' | 'researcher' | 'admin', required): User's role in the organisation.
- `password` (string, required, hashed): User's password (hashed).
- `isVerified` (boolean, default: false): Whether the user's email is verified.
- `otp` (string): One-time password for email verification.
- `otpExpires` (Date): Expiry time for the OTP.

---
## 5. Utilities

### generateOtp

- Generates a 6-digit OTP and expiration time (10 minutes from now).
- Used for account/email verification.

### sendEmail

- Sends an email using SendGrid.
- Used for sending OTPs and notifications.

---

## 6. Database Connection

- MongoDB connection via Mongoose.
- URI from `DB_URI` env variable or defaults to `mongodb://localhost:27017/pocket-impact`.

---

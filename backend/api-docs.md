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
- **Description:** Register a new organisation and admin user.
- **Request Body:**
  - `fullname` (string, required)
  - `email` (string, required)
  - `phonenumber` (string, required)
  - `organisationName` (string, required)
  - `organisationCountry` (string, required)
  - `organisationSize` (string: 'small' | 'medium' | 'large', required)
  - `password` (string, required)
- **Responses:**
  - `201 Created`: User created successfully.
  - `400 Bad Request`: Missing fields, organisation or email already exists.
  - `500 Internal Server Error`: Server error.

### Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Login with email and password.
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Responses:**
  - `200 OK`: Login successful, JWT cookie set.
  - `400 Bad Request`: Invalid credentials.

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
- Returns `401 Unauthorized` if invalid.

### restrictTo(...roles)

- Restricts access to users with specified roles.
- Returns `403 Forbidden` if user role is not allowed.

---

## 4. Models

### Organisation

- `organisationName` (string, required, unique)
- `organisationCountry` (string, required)
- `organisationSize` (string: 'small' | 'medium' | 'large', required)

### User

- `fullname` (string, required)
- `email` (string, required, unique, validated)
- `phonenumber` (string, required, validated)
- `organisation` (ObjectId, ref: Organisation, required)
- `role` (string: 'analyst' | 'researcher' | 'admin', required)
- `password` (string, required, hashed)

---

## 5. Database Connection

- MongoDB connection via Mongoose.
- URI from `DB_URI` env variable or defaults to `mongodb://localhost:27017/pocket-impact`.

---

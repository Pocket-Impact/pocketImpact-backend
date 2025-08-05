

## 🛠️ Getting Started: Local Backend Setup Guide

Follow these steps to run the Pocket Impact Node.js + Express backend API locally.

---
## 1. Requirements

- Node.js v18 or higher
- npm (comes with Node.js)
- MongoDB (Atlas cloud or local instance)
- SendGrid account with a verified sender email

---

## 2. Cloning the Repo

Clone or fork this repository:

```bash
git clone https://github.com/your-username/pocketImpact-backend.git
cd pocketImpact-backend/
```

---
## 3. Installing Dependencies

Install all backend dependencies:

```bash
npm install
```

---

## 4. Creating the .env File

Create a `.env` file inside the `backend` directory with the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@email.com
```

### .env.example

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pocket-impact
JWT_SECRET=supersecretkey
SENDGRID_API_KEY=SG.xxxxxxxx
FROM_EMAIL=verified@yourdomain.com
```

---

## 5. Running the Server

Start the backend server in development mode:

```bash
npm run dev
```

The server will start at [http://localhost:5000]

---

## 6. Testing the API

You can use tools like [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to test API routes such as:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `GET /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

---

## 7. Frontend Connection

This backend is designed to connect to a frontend client (e.g. Next.js) running at [http://localhost:3000]
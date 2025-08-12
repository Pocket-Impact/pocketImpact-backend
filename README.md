

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
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@email.com
```

### .env.example

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pocket-impact
ACCESS_TOKEN_SECRET=superaccesstokensecret
REFRESH_TOKEN_SECRET=superrefreshtokensecret
SENDGRID_API_KEY=SG.xxxxxxxx
FROM_EMAIL=verified@yourdomain.com
```

---

## 5. Running the Server

Start the backend server in development mode:

```bash
npm run dev
```


The server will start at [http://localhost:5000](http://localhost:5000).

---

## 6. Testing the API





You can use tools like [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to test API routes. All successful responses use:

```json
{
  "status": "success",
  "message": "...",
  "data": { ... }
}
```
All error responses use:
```json
{
  "status": "fail",
  "message": "..."
}
```

#### Sentiment Analysis in Feedback

When submitting feedback via `POST /api/feedback`, each answer is automatically analyzed for sentiment (positive, negative, neutral) and the result is included in the response and stored in the database.

Example feedback response:
```json
{
  "status": "success",
  "message": "Feedback submitted successfully.",
  "data": {
    "feedback": {
      "id": "feedbackId",
      "survey": "survey123",
      "feedbacks": [
        {
          "questionId": "q1",
          "answer": "Very satisfied",
          "sentiment": "positive"
        },
        {
          "questionId": "q2",
          "answer": "More vegan options",
          "sentiment": "neutral"
        }
      ]
    }
  }
}
```

### Example API Routes

- `POST /api/auth/signup` (see api-docs for example body)
- `POST /api/auth/login` *(returns access and refresh tokens as cookies)*
- `POST /api/auth/verify-otp`
- `GET /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/logout`
- `POST /api/auth/refresh-token` *(get new access token using refresh token)*
- `POST /api/users/add-user`
- `POST /api/surveys` *(create survey)*
- `POST /api/feedback` *(submit feedback, includes sentiment)*

---

## 7. Frontend Connection



This backend is designed to connect to a frontend client (e.g. Next.js) running at [http://localhost:3000].

---

## 8. Notes



- **Never push your `.env` file to GitHub or share it publicly.**
- Use a SendGrid account with a verified sender email address.
- Ensure your MongoDB URI is valid and accessible.
- For production, use strong secrets and secure environment variables.
- Refresh tokens are stored securely as httpOnly cookies.
- Access tokens are short-lived; use `/api/auth/refresh-token` to get a new one when expired.
- JWT authentication is used for all protected routes.
- All request bodies are validated using Joi schemas (see `src/schemas/`).
- All responses are standardized for frontend consumption.
- Make sure your environment variable names match those expected in your code (e.g. `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`).
 - Automated tests are provided for controllers and validation schemas. See the `src/tests/` directory for details. DB-dependent tests are skipped to avoid timeouts in CI/local environments.
- Run tests with `npm run test` (see `src/tests/`).
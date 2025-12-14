# FitPlanHub - Trainers & Users Platform

A full-stack fitness platform where certified trainers create fitness plans and users purchase & follow these plans.

## Features

- **User & Trainer Authentication**: Signup and login for both trainers and regular users with JWT token authentication
- **Trainer Dashboard**: Create, edit, and delete fitness plans
- **User Subscriptions**: Users can purchase/subscribe to fitness plans
- **Access Control**: Non-subscribers see previews, subscribers get full access
- **Follow Trainers**: Users can follow/unfollow trainers
- **Personalized Feed**: Users see plans from trainers they follow

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React
- React Router
- Axios for API calls
- Context API for state management

## Project Structure

```
fit_plan_hub/
├── server.js              # Main server file
├── models/                # Database models
│   ├── User.js
│   ├── Plan.js
│   ├── Subscription.js
│   └── Follow.js
├── routes/                # API routes
│   ├── auth.js
│   ├── plans.js
│   ├── subscriptions.js
│   ├── trainers.js
│   └── feed.js
├── middleware/            # Middleware
│   └── auth.js
└── client/                # React frontend
    ├── src/
    │   ├── components/
    │   ├── context/
    │   └── App.js
    └── public/
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitplanhub
JWT_SECRET=your_secret_key_here_change_this_in_production
```

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up (user or trainer)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Plans
- `GET /api/plans` - Get all plans (public, with access control)
- `GET /api/plans/:id` - Get single plan (with access control)
- `POST /api/plans` - Create plan (trainer only)
- `PUT /api/plans/:id` - Update plan (trainer only, own plans)
- `DELETE /api/plans/:id` - Delete plan (trainer only, own plans)

### Subscriptions
- `POST /api/subscriptions/:planId` - Subscribe to a plan (user only)
- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions (user only)

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get trainer profile with plans
- `POST /api/trainers/:id/follow` - Follow a trainer (user only)
- `DELETE /api/trainers/:id/follow` - Unfollow a trainer (user only)
- `GET /api/trainers/following/list` - Get list of followed trainers (user only)

### Feed
- `GET /api/feed` - Get personalized feed (user only)

## Database Schema

### User
- name (String)
- email (String, unique)
- password (String, hashed)
- role (String: 'user' or 'trainer')
- createdAt (Date)

### Plan
- title (String)
- description (String)
- price (Number)
- duration (Number, days)
- trainer (ObjectId, ref: User)
- createdAt (Date)
- updatedAt (Date)

### Subscription
- user (ObjectId, ref: User)
- plan (ObjectId, ref: Plan)
- purchasedAt (Date)
- expiresAt (Date)
- status (String: 'active' or 'expired')

### Follow
- user (ObjectId, ref: User)
- trainer (ObjectId, ref: User)
- followedAt (Date)

## Usage

1. **As a Trainer:**
   - Sign up with role "trainer"
   - Login to access dashboard
   - Create fitness plans with title, description, price, and duration
   - Edit or delete your own plans

2. **As a User:**
   - Sign up with role "user" (default)
   - Browse all available plans on the landing page
   - View plan details (preview for non-subscribers)
   - Subscribe to plans
   - Follow trainers
   - View personalized feed with plans from followed trainers

## Testing with Postman

Import the `FitPlanHub.postman_collection.json` file into Postman to test all API endpoints.

**Note:** Make sure to:
1. Set the `Authorization` header with `Bearer <token>` for protected routes
2. Update the base URL if your server runs on a different port
3. Use the token received from login/signup for authenticated requests

## License

ISC


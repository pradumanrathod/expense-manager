# Budget-Aware Expense Tracker

A full-stack MERN application for tracking expenses with budget awareness, deployable on Vercel.

## Features

- 🔐 User Authentication (JWT)
- 📊 Budget Management per Category per Month
- 💰 Expense Tracking with Real-time Budget Validation
- 📈 Monthly Reports with Visualizations
- 🎨 Category Management with Color Coding
- 📱 Responsive Design (Mobile + Desktop)
- ⚡ Real-time Budget Progress Indicators

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication
- Vercel Serverless Functions

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form
- Recharts
- React Hot Toast

## Project Structure

```
expense-tracker/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── server/              # Backend API
│   ├── api/            # Vercel serverless functions
│   ├── models/
│   ├── config/
│   ├── middleware/
│   └── utils/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Git

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `server/` directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
JWT_SECRET=your_jwt_secret_key_min_32_characters_long
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

4. For local development, create `server/index.js` (optional):
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Run development server:
```bash
npm run dev
```

## MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP: `0.0.0.0/0` (for serverless functions)
4. Get connection string and add to `.env` file

## Deployment

### Backend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `server`
4. Add environment variables in Vercel dashboard
5. Deploy

### Frontend (Vercel)

1. Create separate Vercel project
2. Set root directory to `client`
3. Add `VITE_API_URL` environment variable (backend URL)
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets?month=6&year=2025` - Get budgets
- `POST /api/budgets` - Create/update budget
- `DELETE /api/budgets/:id` - Delete budget

### Expenses
- `GET /api/expenses?month=6&year=2025` - Get expenses
- `POST /api/expenses` - Create expense
- `POST /api/expenses/check-budget` - Check budget before adding
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Reports
- `GET /api/reports/monthly?month=6&year=2025` - Monthly spending summary

## License

ISC


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from './config/db.js';
import mockLogin from './api/auth/mock-login.js';
import mockSignup from './api/auth/mock-signup.js';
import mockCategories from './api/mock-categories/index.js';
import mockExpenses from './api/mock-expenses/index.js';
import mockCheckBudget from './api/mock-expenses/check-budget.js';
import mockBudgets from './api/mock-budgets/index.js';
import mockReports from './api/mock-reports/monthly.js';

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in server directory
dotenv.config({ path: join(__dirname, '.env') });

// Debug: Check if env vars are loaded (remove in production)
console.log('🔍 Environment check:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'Not set (using default)');
console.log('');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', mode: 'MOCK MODE - No MongoDB required' });
});

// Mock API routes (for testing without MongoDB)
app.post('/api/auth/mock-login', mockLogin);
app.post('/api/auth/mock-signup', mockSignup);
app.get('/api/mock-categories', mockCategories);
app.post('/api/mock-categories', mockCategories);
app.get('/api/mock-expenses', mockExpenses);
app.post('/api/mock-expenses', mockExpenses);
app.post('/api/mock-expenses/check-budget', mockCheckBudget);
app.get('/api/mock-budgets', mockBudgets);
app.post('/api/mock-budgets', mockBudgets);
app.get('/api/mock-reports/monthly', mockReports);

// Try to connect to MongoDB (optional - mock mode works without it)
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/expense-tracker') {
  connectDB()
    .then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${mongoose.connection.name}`);
    })
    .catch((error) => {
      console.log('⚠️  MongoDB not connected - Running in MOCK MODE');
      console.log('   Using in-memory data storage');
    });
} else {
  console.log('📝 Running in MOCK MODE (No MongoDB required)');
  console.log('   Using in-memory data storage');
  console.log('   Login with any email and password: "password123"');
}

// Note: For local development, you can import and use your API routes here
// However, since we're using Vercel serverless functions, the routes are in /api folder
// For full local testing, you might want to set up route handlers here
// For now, this server just provides a health check

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n🎭 MOCK MODE ACTIVE`);
  console.log(`   - Login: Use any email + password "password123"`);
  console.log(`   - Pre-loaded with sample categories, budgets, and expenses`);
  console.log(`   - All data is stored in memory (resets on server restart)`);
  console.log(`\n📝 Mock API Endpoints:`);
  console.log(`   POST /api/auth/mock-login`);
  console.log(`   POST /api/auth/mock-signup`);
  console.log(`   GET/POST /api/mock-categories`);
  console.log(`   GET/POST /api/mock-expenses`);
  console.log(`   GET/POST /api/mock-budgets`);
  console.log(`   GET /api/mock-reports/monthly`);
});


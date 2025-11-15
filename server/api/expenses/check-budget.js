import { connectDB } from '../../config/db.js';
import Budget from '../../models/Budget.js';
import Expense from '../../models/Expense.js';
import { authenticateUser } from '../../middleware/auth.js';
import { expenseValidation } from '../../utils/validation.js';
import { validationResult } from 'express-validator';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Authenticate user
    const { userId } = await authenticateUser(req);

    // Validate input
    await Promise.all(expenseValidation.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryId, amount, date } = req.body;

    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1; // 1-12
    const year = expenseDate.getFullYear();

    // Find budget for this category and month
    const budget = await Budget.findOne({
      userId,
      categoryId,
      month,
      year,
    });

    if (!budget) {
      // No budget set, return info
      return res.status(200).json({
        withinBudget: true,
        spent: 0,
        budget: 0,
        remaining: 0,
        hasBudget: false,
      });
    }

    // Calculate total spent for this category and month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId,
      categoryId,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newTotal = totalSpent + parseFloat(amount);
    const remaining = budget.amount - newTotal;
    const withinBudget = newTotal <= budget.amount;

    return res.status(200).json({
      withinBudget,
      spent: totalSpent,
      newTotal,
      budget: budget.amount,
      remaining: Math.max(0, remaining),
      hasBudget: true,
    });
  } catch (error) {
    console.error('Budget check error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


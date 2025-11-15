import { connectDB } from '../../config/db.js';
import Expense from '../../models/Expense.js';
import { authenticateUser } from '../../middleware/auth.js';
import { expenseValidation } from '../../utils/validation.js';
import { validationResult } from 'express-validator';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // Authenticate user
    const { userId } = await authenticateUser(req);

    if (req.method === 'GET') {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
      }

      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .populate('categoryId', 'name color')
        .sort({ date: -1 });

      return res.status(200).json(expenses);
    }

    if (req.method === 'POST') {
      // Validate input
      await Promise.all(expenseValidation.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { categoryId, amount, description, date } = req.body;

      // Create expense
      const expense = new Expense({
        userId,
        categoryId,
        amount: parseFloat(amount),
        description: description || '',
        date: new Date(date),
      });

      await expense.save();
      await expense.populate('categoryId', 'name color');

      return res.status(201).json(expense);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Expenses error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


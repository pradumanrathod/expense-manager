import { connectDB } from '../../config/db.js';
import Expense from '../../models/Expense.js';
import { authenticateUser } from '../../middleware/auth.js';
import { expenseValidation } from '../../utils/validation.js';
import { validationResult } from 'express-validator';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // Authenticate user
    const { userId } = await authenticateUser(req);

    const { id } = req.query;

    if (req.method === 'PUT') {
      // Validate input
      await Promise.all(expenseValidation.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find expense and verify ownership
      const expense = await Expense.findOne({ _id: id, userId: req.userId });
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      const { categoryId, amount, description, date } = req.body;

      // Update expense
      expense.categoryId = categoryId;
      expense.amount = parseFloat(amount);
      expense.description = description || '';
      expense.date = new Date(date);

      await expense.save();
      await expense.populate('categoryId', 'name color');

      return res.status(200).json(expense);
    }

    if (req.method === 'DELETE') {
      // Find expense and verify ownership
      const expense = await Expense.findOne({ _id: id, userId });
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      await Expense.deleteOne({ _id: id, userId });
      return res.status(200).json({ message: 'Expense deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Expense error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


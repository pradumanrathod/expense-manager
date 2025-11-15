import { connectDB } from '../../config/db.js';
import Budget from '../../models/Budget.js';
import { authenticateUser } from '../../middleware/auth.js';
import { budgetValidation } from '../../utils/validation.js';
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

      const budgets = await Budget.find({
        userId,
        month: parseInt(month),
        year: parseInt(year),
      }).populate('categoryId', 'name color');

      return res.status(200).json(budgets);
    }

    if (req.method === 'POST') {
      // Validate input
      await Promise.all(budgetValidation.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { categoryId, amount, month, year } = req.body;

      // Check if budget already exists
      let budget = await Budget.findOne({
        userId,
        categoryId,
        month: parseInt(month),
        year: parseInt(year),
      });

      if (budget) {
        // Update existing budget
        budget.amount = parseFloat(amount);
        await budget.save();
        await budget.populate('categoryId', 'name color');
        return res.status(200).json(budget);
      } else {
        // Create new budget
        budget = new Budget({
          userId,
          categoryId,
          amount: parseFloat(amount),
          month: parseInt(month),
          year: parseInt(year),
        });
        await budget.save();
        await budget.populate('categoryId', 'name color');
        return res.status(201).json(budget);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budgets error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


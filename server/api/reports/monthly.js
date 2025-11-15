import { connectDB } from '../../config/db.js';
import Budget from '../../models/Budget.js';
import Expense from '../../models/Expense.js';
import Category from '../../models/Category.js';
import { authenticateUser } from '../../middleware/auth.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Authenticate user
    const { userId } = await authenticateUser(req);

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // Get all categories for user
    const categories = await Category.find({ userId });

    // Get all budgets for the month
    const budgets = await Budget.find({
      userId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate('categoryId', 'name color');

    // Get all expenses for the month
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Calculate spending per category
    const categorySpending = {};
    expenses.forEach((expense) => {
      const catId = expense.categoryId.toString();
      if (!categorySpending[catId]) {
        categorySpending[catId] = 0;
      }
      categorySpending[catId] += expense.amount;
    });

    // Build report
    const report = categories.map((category) => {
      const budget = budgets.find(
        (b) => b.categoryId._id.toString() === category._id.toString()
      );
      const spent = categorySpending[category._id.toString()] || 0;
      const budgetAmount = budget ? budget.amount : 0;
      const remaining = budgetAmount - spent;

      return {
        categoryId: category._id,
        categoryName: category.name,
        categoryColor: category.color,
        budget: budgetAmount,
        spent: spent,
        remaining: remaining,
        withinBudget: remaining >= 0,
      };
    });

    // Calculate totals
    const totalBudget = report.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = report.reduce((sum, item) => sum + item.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    return res.status(200).json({
      month: parseInt(month),
      year: parseInt(year),
      categories: report,
      totals: {
        budget: totalBudget,
        spent: totalSpent,
        remaining: totalRemaining,
      },
    });
  } catch (error) {
    console.error('Reports error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


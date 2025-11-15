import { storage } from '../../mock-data.js';
import jwt from 'jsonwebtoken';

function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dummy_secret_key_for_testing_only');
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
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
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { month, year } = req.query;
    const categories = storage.categories.filter((c) => c.userId === userId);
    const budgets = storage.budgets.filter(
      (b) => b.userId === userId && b.month === parseInt(month) && b.year === parseInt(year)
    );
    const expenses = storage.expenses.filter((e) => {
      if (e.userId !== userId) return false;
      const eDate = new Date(e.date);
      return eDate.getMonth() + 1 === parseInt(month) && eDate.getFullYear() === parseInt(year);
    });

    // Calculate spending per category
    const categorySpending = {};
    expenses.forEach((expense) => {
      const catId = expense.categoryId;
      if (!categorySpending[catId]) {
        categorySpending[catId] = 0;
      }
      categorySpending[catId] += expense.amount;
    });

    // Build report
    const report = categories.map((category) => {
      const budget = budgets.find((b) => b.categoryId === category._id);
      const spent = categorySpending[category._id] || 0;
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
    console.error('Mock reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { categoryId, amount, date } = req.body;
    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    // Find budget
    const budget = storage.budgets.find(
      (b) => b.userId === userId && b.categoryId === categoryId && b.month === month && b.year === year
    );

    if (!budget) {
      return res.status(200).json({
        withinBudget: true,
        spent: 0,
        budget: 0,
        remaining: 0,
        hasBudget: false,
      });
    }

    // Calculate spent
    const expenses = storage.expenses.filter((e) => {
      if (e.userId !== userId || e.categoryId !== categoryId) return false;
      const eDate = new Date(e.date);
      return eDate.getMonth() + 1 === month && eDate.getFullYear() === year;
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
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
    console.error('Mock budget check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


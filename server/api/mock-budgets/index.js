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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { month, year } = req.query;
      let budgets = storage.budgets.filter((b) => b.userId === userId);

      if (month && year) {
        budgets = budgets.filter(
          (b) => b.month === parseInt(month) && b.year === parseInt(year)
        );
      }

      // Populate categoryId
      budgets = budgets.map((b) => ({
        ...b,
        categoryId: storage.categories.find((c) => c._id === b.categoryId) || { _id: b.categoryId, name: 'Unknown', color: '#000000' },
      }));

      return res.status(200).json(budgets);
    }

    if (req.method === 'POST') {
      const { categoryId, amount, month, year } = req.body;
      
      let budget = storage.budgets.find(
        (b) => b.userId === userId && b.categoryId === categoryId && b.month === parseInt(month) && b.year === parseInt(year)
      );

      if (budget) {
        budget.amount = parseFloat(amount);
      } else {
        budget = {
          _id: String(storage.budgets.length + 1),
          userId,
          categoryId,
          amount: parseFloat(amount),
          month: parseInt(month),
          year: parseInt(year),
        };
        storage.budgets.push(budget);
      }

      // Populate categoryId
      const category = storage.categories.find((c) => c._id === categoryId);
      budget.categoryId = category || { _id: categoryId, name: 'Unknown', color: '#000000' };

      return res.status(200).json(budget);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Mock budgets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


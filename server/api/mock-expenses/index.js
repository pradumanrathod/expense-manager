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
      let expenses = storage.expenses.filter((e) => e.userId === userId);

      if (month && year) {
        expenses = expenses.filter((e) => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() + 1 === parseInt(month) && expenseDate.getFullYear() === parseInt(year);
        });
      }

      // Populate categoryId
      expenses = expenses.map((e) => ({
        ...e,
        categoryId: storage.categories.find((c) => c._id === e.categoryId) || { _id: e.categoryId, name: 'Unknown', color: '#000000' },
      }));

      return res.status(200).json(expenses);
    }

    if (req.method === 'POST') {
      const { categoryId, amount, description, date } = req.body;
      const newExpense = {
        _id: String(storage.expenses.length + 1),
        userId,
        categoryId,
        amount: parseFloat(amount),
        description: description || '',
        date: new Date(date),
        createdAt: new Date(),
      };
      storage.expenses.push(newExpense);

      // Populate categoryId
      const category = storage.categories.find((c) => c._id === categoryId);
      newExpense.categoryId = category || { _id: categoryId, name: 'Unknown', color: '#000000' };

      return res.status(201).json(newExpense);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Mock expenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


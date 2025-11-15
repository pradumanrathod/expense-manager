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
      const categories = storage.categories.filter((c) => c.userId === userId);
      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      const { name, color } = req.body;
      const newCategory = {
        _id: String(storage.categories.length + 1),
        userId,
        name,
        color,
        createdAt: new Date(),
      };
      storage.categories.push(newCategory);
      return res.status(201).json(newCategory);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Mock categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


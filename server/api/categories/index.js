import { connectDB } from '../../config/db.js';
import Category from '../../models/Category.js';
import { authenticateUser } from '../../middleware/auth.js';
import { categoryValidation } from '../../utils/validation.js';
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
      // Get all categories for user
      const categories = await Category.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      // Validate input
      await Promise.all(categoryValidation.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color } = req.body;

      // Check if category with same name exists
      const existingCategory = await Category.findOne({ userId, name });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }

      // Create category
      const category = new Category({
        userId,
        name,
        color,
      });

      await category.save();
      return res.status(201).json(category);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Categories error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


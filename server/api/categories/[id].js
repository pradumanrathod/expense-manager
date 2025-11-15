import { connectDB } from '../../config/db.js';
import Category from '../../models/Category.js';
import { authenticateUser } from '../../middleware/auth.js';
import { categoryValidation } from '../../utils/validation.js';
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
      await Promise.all(categoryValidation.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color } = req.body;

      // Find category and verify ownership
      const category = await Category.findOne({ _id: id, userId });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check if another category with same name exists
      const existingCategory = await Category.findOne({
        userId,
        name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }

      // Update category
      category.name = name;
      category.color = color;
      await category.save();

      return res.status(200).json(category);
    }

    if (req.method === 'DELETE') {
      // Find category and verify ownership
      const category = await Category.findOne({ _id: id, userId });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await Category.deleteOne({ _id: id, userId });
      return res.status(200).json({ message: 'Category deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Category error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


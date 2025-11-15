import { connectDB } from '../../config/db.js';
import Budget from '../../models/Budget.js';
import { authenticateUser } from '../../middleware/auth.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Authenticate user
    const { userId } = await authenticateUser(req);

    const { id } = req.query;

    // Find budget and verify ownership
    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await Budget.deleteOne({ _id: id, userId });
    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Budget delete error:', error);
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
}


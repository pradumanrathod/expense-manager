import jwt from 'jsonwebtoken';
import { storage } from '../../mock-data.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Dummy login - accept any email with password "password123"
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Simple check - accept "password123" for any email
    if (password !== 'password123') {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Find or create user
    let user = storage.users.find((u) => u.email === email);
    if (!user) {
      user = {
        _id: String(storage.users.length + 1),
        name: email.split('@')[0],
        email: email,
      };
      storage.users.push(user);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dummy_secret_key_for_testing_only',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Mock login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}


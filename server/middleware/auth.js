import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// For serverless functions - returns user or throws error
export async function authenticateUser(req) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided, authorization denied');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    throw new Error('No token provided, authorization denied');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new Error('Token is not valid, user not found');
    }

    return { user, userId: decoded.userId };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw error;
  }
}

// Traditional Express middleware (for non-serverless use)
export const authenticate = async (req, res, next) => {
  try {
    const { user, userId } = await authenticateUser(req);
    req.user = user;
    req.userId = userId;
    next();
  } catch (error) {
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error during authentication' });
  }
};


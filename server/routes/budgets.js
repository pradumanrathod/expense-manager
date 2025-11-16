import express from 'express';
import Budget from '../models/Budget.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const budgets = await Budget.find({
      userId: req.userId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate('categoryId');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, month, year } = req.body;
    if (!categoryId || amount === undefined || !month || !year) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const budget = await Budget.findOneAndUpdate(
      { categoryId, month, year, userId: req.userId },
      { amount, categoryId, month, year, userId: req.userId },
      { new: true, upsert: true }
    ).populate('categoryId');
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


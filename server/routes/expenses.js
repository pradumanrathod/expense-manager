import express from 'express';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('categoryId');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, date, description } = req.body;
    if (!categoryId || !amount || !date) {
      return res.status(400).json({ error: 'Category, amount, and date required' });
    }
    const expense = new Expense({
      categoryId,
      amount: parseFloat(amount),
      date: new Date(date),
      description,
      userId: req.userId,
    });
    await expense.save();
    await expense.populate('categoryId');
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { categoryId, amount, date, description } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { categoryId, amount: parseFloat(amount), date: new Date(date), description },
      { new: true }
    ).populate('categoryId');
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/check-budget', async (req, res) => {
  try {
    const { categoryId, amount, date } = req.body;
    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    const budget = await Budget.findOne({
      categoryId,
      month,
      year,
      userId: req.userId,
    });

    if (!budget) {
      return res.json({ hasBudget: false });
    }

    const expenses = await Expense.find({
      categoryId,
      userId: req.userId,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      },
    });

    const currentTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const newTotal = currentTotal + parseFloat(amount);
    const remaining = budget.amount - newTotal;
    const withinBudget = remaining >= 0;

    res.json({
      hasBudget: true,
      budget: budget.amount,
      currentTotal,
      newTotal,
      remaining,
      withinBudget,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


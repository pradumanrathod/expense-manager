import express from 'express';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    const budgets = await Budget.find({
      userId: req.userId,
      month: monthNum,
      year: yearNum,
    }).populate('categoryId');

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('categoryId');

    const categories = await Category.find({ userId: req.userId });

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id] = {
        categoryId: cat._id,
        categoryName: cat.name,
        categoryColor: cat.color,
        budget: 0,
        spent: 0,
        remaining: 0,
        withinBudget: true,
      };
    });

    budgets.forEach((budget) => {
      const catId = budget.categoryId._id.toString();
      if (categoryMap[catId]) {
        categoryMap[catId].budget = budget.amount;
      }
    });

    expenses.forEach((expense) => {
      const catId = expense.categoryId._id.toString();
      if (categoryMap[catId]) {
        categoryMap[catId].spent += expense.amount;
      }
    });

    const reportCategories = Object.values(categoryMap).map((item) => {
      item.remaining = item.budget - item.spent;
      item.withinBudget = item.remaining >= 0;
      return item;
    });

    const totals = reportCategories.reduce(
      (acc, item) => {
        acc.budget += item.budget;
        acc.spent += item.spent;
        return acc;
      },
      { budget: 0, spent: 0 }
    );
    totals.remaining = totals.budget - totals.spent;

    res.json({
      totals,
      categories: reportCategories,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


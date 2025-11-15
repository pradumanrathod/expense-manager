import { useState, useEffect } from 'react';
import { budgetsAPI, expensesAPI, categoriesAPI } from '../utils/api';
import { formatCurrency, getCurrentMonthYear, getMonthName, calculatePercentage } from '../utils/helpers';
import ExpenseForm from '../components/ExpenseForm';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonthYear().month);
  const [year, setYear] = useState(getCurrentMonthYear().year);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, budgetsRes, expensesRes] = await Promise.all([
        categoriesAPI.getAll(),
        budgetsAPI.getByMonth(month, year),
        expensesAPI.getByMonth(month, year),
      ]);

      setCategories(categoriesRes.data);
      setBudgets(budgetsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = (categoryId) => {
    const budget = budgets.find((b) => b.categoryId._id === categoryId);
    const categoryExpenses = expenses.filter(
      (e) => e.categoryId._id === categoryId
    );
    const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetAmount = budget ? budget.amount : 0;
    const remaining = budgetAmount - spent;
    const percentage = calculatePercentage(spent, budgetAmount);

    return {
      budget: budgetAmount,
      spent,
      remaining,
      percentage,
      hasBudget: !!budget,
      overBudget: remaining < 0,
    };
  };

  const handleExpenseAdded = () => {
    fetchData();
  };

  // Generate years list (current year ± 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            {getMonthName(month)} {year}
          </h1>
          <div className="flex space-x-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No categories yet</p>
          <p className="text-sm text-gray-500">
            Go to Categories page to create your first category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => {
            const data = getCategoryData(category._id);
            return (
              <CategoryCard
                key={category._id}
                category={category}
                data={data}
              />
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-40"
      >
        +
      </button>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        categories={categories}
        onSuccess={handleExpenseAdded}
      />
    </div>
  );
}

function CategoryCard({ category, data }) {
  const { budget, spent, remaining, percentage, hasBudget, overBudget } = data;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div
          className="w-4 h-4 rounded-full mr-3"
          style={{ backgroundColor: category.color }}
        />
        <h3 className="font-semibold text-gray-800">{category.name}</h3>
      </div>

      {hasBudget ? (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {formatCurrency(spent)} / {formatCurrency(budget)} spent
              </span>
              <span className={overBudget ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                {formatCurrency(Math.abs(remaining))} {overBudget ? 'over' : 'remaining'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  overBudget ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
          {overBudget && (
            <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded inline-block">
              OVER BUDGET
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500">
          No budget set for this month
        </div>
      )}
    </div>
  );
}


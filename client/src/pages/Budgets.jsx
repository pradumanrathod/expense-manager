import { useState, useEffect } from 'react';
import { budgetsAPI, categoriesAPI } from '../utils/api';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Budgets() {
  const [month, setMonth] = useState(getCurrentMonthYear().month);
  const [year, setYear] = useState(getCurrentMonthYear().year);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, budgetsRes] = await Promise.all([
        categoriesAPI.getAll(),
        budgetsAPI.getByMonth(month, year),
      ]);

      setCategories(categoriesRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetForCategory = (categoryId) => {
    return budgets.find((b) => b.categoryId._id === categoryId);
  };

  const handleBudgetChange = async (categoryId, amount) => {
    const budgetAmount = parseFloat(amount) || 0;

    if (budgetAmount < 0) {
      toast.error('Budget cannot be negative');
      return;
    }

    try {
      setSaving({ ...saving, [categoryId]: true });
      await budgetsAPI.createOrUpdate({
        categoryId,
        amount: budgetAmount,
        month,
        year,
      });
      toast.success('Budget saved');
      fetchData();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error(error.response?.data?.error || 'Failed to save budget');
    } finally {
      setSaving({ ...saving, [categoryId]: false });
    }
  };

  // Generate years list
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-white text-lg font-medium">Loading budgets...</p>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-white mb-1">Budgets</h1>
            <p className="text-gray-300">Track and manage your monthly budgets</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-auto"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m} className="bg-gray-800">
                  {getMonthName(m - 1)}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-auto"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-gray-800">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-white text-sm md:text-base font-medium">
          Set budgets for {getMonthName(month)} {year}
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl shadow-xl animate-scale-in">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-700 text-lg font-medium mb-4">No categories yet</p>
          <p className="text-sm text-gray-600 mb-6">
            Go to Categories page to create your first category
          </p>
          <button
            onClick={() => (window.location.href = '/categories')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {categories.map((category) => {
            const budget = getBudgetForCategory(category._id);
            const spent = budget?.spent || 0;
            const amount = budget?.amount || 0;
            const percentage = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;
            const remaining = amount - spent;
            const isOverBudget = remaining < 0;

            return (
              <div key={category._id} className="glass rounded-2xl p-6 shadow-xl card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-300">
                      {formatCurrency(spent)} of {formatCurrency(amount)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        isOverBudget ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(remaining))} {isOverBudget ? 'over' : 'left'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      isOverBudget
                        ? 'bg-red-500'
                        : percentage > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mb-4">
                  <span>0%</span>
                  <span>{Math.round(percentage)}% used</span>
                  <span>100%</span>
                </div>

                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={budget?.amount || ''}
                    onChange={(e) => handleBudgetChange(category._id, e.target.value)}
                    placeholder="Set budget"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />

                  {saving[category._id] && (
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

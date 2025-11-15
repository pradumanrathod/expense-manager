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

  const handleSaveAll = async () => {
    const inputs = document.querySelectorAll('input[type="number"]');
    let hasChanges = false;

    for (const input of inputs) {
      const categoryId = input.dataset.categoryId;
      const amount = parseFloat(input.value) || 0;
      const existingBudget = getBudgetForCategory(categoryId);

      if (!existingBudget || existingBudget.amount !== amount) {
        hasChanges = true;
        await handleBudgetChange(categoryId, amount);
      }
    }

    if (!hasChanges) {
      toast.info('No changes to save');
    }
  };

  // Generate years list
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
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Set Budgets
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
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save All
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Set budgets for {getMonthName(month)} {year}
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No categories yet</p>
          <p className="text-sm text-gray-500">
            Go to Categories page to create your first category
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Budget Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => {
                  const budget = getBudgetForCategory(category._id);

                  return (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          data-category-id={category._id}
                          key={`${category._id}-${budget?.amount || ''}`}
                          defaultValue={budget?.amount || ''}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              handleBudgetChange(category._id, value);
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {saving[category._id] ? (
                          <span className="text-gray-500">Saving...</span>
                        ) : budget ? (
                          <span className="text-green-600">Saved</span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


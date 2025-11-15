import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { expensesAPI } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ExpenseForm({ isOpen, onClose, categories, onSuccess }) {
  const [checkingBudget, setCheckingBudget] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setBudgetStatus(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      // First check budget
      setCheckingBudget(true);
      const budgetCheck = await expensesAPI.checkBudget({
        categoryId: data.categoryId,
        amount: parseFloat(data.amount),
        date: data.date,
      });

      setBudgetStatus(budgetCheck.data);

      if (budgetCheck.data.withinBudget) {
        toast.success(
          `Within budget! ₹${formatCurrency(budgetCheck.data.remaining)} remaining`,
          { icon: '✅' }
        );
      } else {
        toast.error(
          `Over budget! Exceeded by ₹${formatCurrency(Math.abs(budgetCheck.data.remaining))}`,
          { icon: '⚠️' }
        );
      }

      // Then create expense
      await expensesAPI.create(data);
      toast.success('Expense added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error(error.response?.data?.error || 'Failed to add expense');
    } finally {
      setCheckingBudget(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description..."
            />
          </div>

          {budgetStatus && budgetStatus.hasBudget && (
            <div
              className={`p-3 rounded-lg ${
                budgetStatus.withinBudget
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p className="text-sm font-medium">
                {budgetStatus.withinBudget ? '✅ Within Budget' : '⚠️ Over Budget'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Spent: {formatCurrency(budgetStatus.newTotal)} /{' '}
                {formatCurrency(budgetStatus.budget)}
              </p>
              <p className="text-xs text-gray-600">
                Remaining: {formatCurrency(budgetStatus.remaining)}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={checkingBudget}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {checkingBudget ? 'Checking...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


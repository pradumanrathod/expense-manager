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
      toast.success('Expense added successfully 🎉');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add Expense 💸</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl transition-transform duration-300 hover:rotate-90"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="animate-slide-up">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-medium"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1 animate-slide-down">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-medium"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1 animate-slide-down">{errors.amount.message}</p>
            )}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-medium"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1 animate-slide-down">{errors.date.message}</p>
            )}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
              placeholder="Optional description..."
            />
          </div>

          {budgetStatus && budgetStatus.hasBudget && (
            <div
              className={`p-4 rounded-xl border-2 animate-slide-up ${
                budgetStatus.withinBudget
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
              }`}
              style={{ animationDelay: '400ms' }}
            >
              <p className={`text-sm font-bold mb-2 ${
                budgetStatus.withinBudget ? 'text-green-700' : 'text-red-700'
              }`}>
                {budgetStatus.withinBudget ? '✅ Within Budget' : '⚠️ Over Budget'}
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  Spent: <span className="font-semibold">{formatCurrency(budgetStatus.newTotal)}</span> /{' '}
                  <span className="font-semibold">{formatCurrency(budgetStatus.budget)}</span>
                </p>
                <p>
                  Remaining: <span className={`font-bold ${
                    budgetStatus.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(budgetStatus.remaining)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={checkingBudget}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {checkingBudget ? 'Checking...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

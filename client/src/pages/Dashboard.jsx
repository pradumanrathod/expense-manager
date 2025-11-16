import { useState, useEffect } from 'react';
import { budgetsAPI, expensesAPI, categoriesAPI } from '../utils/api';
import { formatCurrency, getCurrentMonthYear, getMonthName, calculatePercentage } from '../utils/helpers';
import ExpenseForm from '../components/ExpenseForm';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const categoryExpenses = expenses.filter((e) => e.categoryId._id === categoryId);
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

  const pieChartData = categories
    .map((category) => {
      const categoryExpenses = expenses.filter((e) => e.categoryId._id === category._id);
      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        name: category.name,
        value: spent,
        color: category.color,
      };
    })
    .filter((item) => item.value > 0);

  const barChartData = categories.map((category) => {
    const data = getCategoryData(category._id);
    return {
      name: category.name.length > 8 ? category.name.substring(0, 8) + '...' : category.name,
      budget: data.budget,
      spent: data.spent,
      color: category.color,
    };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-gray-200 text-lg font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 text-gray-200">
      {/* Header */}
      <div className="mb-6 animate-slide-down">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-0 drop-shadow-lg">
            {getMonthName(month)} {year} Dashboard
          </h1>

          <div className="flex flex-wrap gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-4 py-2 glass rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium shadow-md hover:shadow-lg transition-all"
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
              className="px-4 py-2 glass rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium shadow-md hover:shadow-lg transition-all"
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

      {/* Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 animate-fade-in">
  <SummaryCard title="Total Budget" value={totalBudget} gradient="from-blue-500 to-cyan-500" delay="0" />
  <SummaryCard title="Total Spent" value={totalSpent} gradient="from-purple-500 to-pink-500" delay="100" />
  <SummaryCard
    title="Remaining"
    value={totalRemaining}
    gradient={totalRemaining >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'}
    delay="200"
  />
</div>


      {/* Charts */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in">
          {/* Pie */}
          <div className="glass rounded-2xl p-6 shadow-xl card-hover">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Expenses by Category</h2>

            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: "#111", border: "0" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">No expenses yet</div>
            )}
          </div>

          {/* Bar */}
          <div className="glass rounded-2xl p-6 shadow-xl card-hover">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Budget vs Spent</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ddd" />
                <YAxis stroke="#ddd" />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: "#111", border: "0" }} />
                <Legend />
                <Bar dataKey="budget" fill="#8b5cf6" />
                <Bar dataKey="spent" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="text-center py-12 glass rounded-2xl shadow-xl animate-scale-in">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-200 text-lg font-medium mb-4">No categories yet</p>
          <p className="text-sm text-gray-300 mb-6">Go to Categories page to create your first category</p>

          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium">
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {categories.map((category, index) => {
            const data = getCategoryData(category._id);
            return <CategoryCard key={category._id} category={category} data={data} index={index} />;
          })}
        </div>
      )}

      {/* Add Expense Button */}
      <button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-all"
      >
        +
      </button>

      <ExpenseForm isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} categories={categories} onSuccess={handleExpenseAdded} />
    </div>
  );
}

function SummaryCard({ title, value, icon, gradient, delay }) {
  return (
    <div className={`glass rounded-2xl p-6 shadow-xl bg-gradient-to-br ${gradient} text-white animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <div className="text-right">
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold">{formatCurrency(value)}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category, data, index }) {
  const { budget, spent, remaining, percentage, hasBudget, overBudget } = data;

  return (
    <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-center mb-4">
        <div className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: category.color }} />
        <h3 className="font-bold text-gray-200 text-lg">{category.name}</h3>
      </div>

      {hasBudget ? (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 font-medium">
                {formatCurrency(spent)} / {formatCurrency(budget)}
              </span>

              <span className={`${overBudget ? 'text-red-400' : 'text-green-400'} font-bold`}>
                {formatCurrency(Math.abs(remaining))} {overBudget ? 'over' : 'left'}
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full ${
                  overBudget
                    ? 'bg-red-500'
                    : percentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            <div className="text-xs text-gray-400 mt-1 text-right">{percentage}% used</div>
          </div>

          {overBudget && (
            <div className="mt-3 px-3 py-2 bg-red-200 text-red-700 text-xs font-bold rounded-lg">
              ⚠️ OVER BUDGET
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-400 py-2">No budget set for this month</div>
      )}
    </div>
  );
}

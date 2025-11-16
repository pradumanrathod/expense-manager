import { useState, useEffect } from 'react';
import { reportsAPI } from '../utils/api';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

export default function Reports() {
  const [month, setMonth] = useState(getCurrentMonthYear().month);
  const [year, setYear] = useState(getCurrentMonthYear().year);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getMonthly(month, year);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // Generate years list
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Prepare chart data
  const pieChartData = report?.categories.map((item) => ({
    name: item.categoryName,
    value: item.spent,
    color: item.categoryColor,
  })) || [];

  const barChartData = report?.categories.map((item) => ({
    name: item.categoryName.length > 10 ? item.categoryName.substring(0, 10) + '...' : item.categoryName,
    budget: item.budget,
    spent: item.spent,
    remaining: item.remaining,
    color: item.categoryColor,
  })) || [];

  const areaChartData = report?.categories.map((item) => ({
    name: item.categoryName.length > 8 ? item.categoryName.substring(0, 8) + '...' : item.categoryName,
    budget: item.budget,
    spent: item.spent,
  })) || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-white text-lg font-medium">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 animate-slide-down">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          📊 Monthly Report
        </h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-4 py-2 glass rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium shadow-md hover:shadow-lg transition-all"
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
            className="px-4 py-2 glass rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium shadow-md hover:shadow-lg transition-all"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 animate-fade-in">
            <div className="glass rounded-2xl p-6 shadow-xl card-hover bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">💰</span>
                <div className="text-right">
                  <p className="text-sm opacity-90 mb-1">Total Budget</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(report.totals.budget)}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 shadow-xl card-hover bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">💸</span>
                <div className="text-right">
                  <p className="text-sm opacity-90 mb-1">Total Spent</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(report.totals.spent)}</p>
                </div>
              </div>
            </div>
            <div className={`glass rounded-2xl p-6 shadow-xl card-hover bg-gradient-to-br text-white ${
              report.totals.remaining < 0 
                ? 'from-red-500 to-rose-500' 
                : 'from-green-500 to-emerald-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{report.totals.remaining < 0 ? '⚠️' : '✅'}</span>
                <div className="text-right">
                  <p className="text-sm opacity-90 mb-1">Remaining</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(report.totals.remaining)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in">
            {/* Pie Chart */}
            <div className="glass rounded-2xl p-6 shadow-xl card-hover">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Expense Distribution</h2>
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
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="glass rounded-2xl p-6 shadow-xl card-hover">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Budget vs Spent</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="budget" fill="#8b5cf6" name="Budget" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="spent" fill="#ec4899" name="Spent" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="glass rounded-2xl p-6 shadow-xl card-hover lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="budget" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorBudget)" name="Budget" />
                  <Area type="monotone" dataKey="spent" stroke="#ec4899" fillOpacity={1} fill="url(#colorSpent)" name="Spent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Table */}
          <div className="glass rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Category Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.categories.map((item, index) => (
                    <tr 
                      key={item.categoryId}
                      className="hover:bg-purple-50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-5 h-5 rounded-full mr-3 shadow-md"
                            style={{ backgroundColor: item.categoryColor }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {item.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {formatCurrency(item.budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {formatCurrency(item.spent)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          item.remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(item.remaining)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.withinBudget ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            ✓ Within Budget
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse">
                            ⚠ Over Budget
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

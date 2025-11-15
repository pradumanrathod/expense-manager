// Mock data for testing without MongoDB
export const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$rOzJqZqZqZqZqZqZqZqZqO', // "password123" hashed
  },
];

export const mockCategories = [
  { _id: '1', userId: '1', name: 'Food', color: '#EF4444', createdAt: new Date() },
  { _id: '2', userId: '1', name: 'Transport', color: '#3B82F6', createdAt: new Date() },
  { _id: '3', userId: '1', name: 'Entertainment', color: '#10B981', createdAt: new Date() },
  { _id: '4', userId: '1', name: 'Shopping', color: '#8B5CF6', createdAt: new Date() },
];

export const mockBudgets = [
  { _id: '1', userId: '1', categoryId: '1', amount: 5000, month: 12, year: 2024 },
  { _id: '2', userId: '1', categoryId: '2', amount: 3000, month: 12, year: 2024 },
  { _id: '3', userId: '1', categoryId: '3', amount: 2000, month: 12, year: 2024 },
];

export const mockExpenses = [
  {
    _id: '1',
    userId: '1',
    categoryId: '1',
    amount: 1500,
    description: 'Grocery shopping',
    date: new Date(2024, 11, 15),
  },
  {
    _id: '2',
    userId: '1',
    categoryId: '1',
    amount: 800,
    description: 'Restaurant',
    date: new Date(2024, 11, 20),
  },
  {
    _id: '3',
    userId: '1',
    categoryId: '2',
    amount: 500,
    description: 'Uber ride',
    date: new Date(2024, 11, 18),
  },
];

// In-memory storage (simulates database)
export const storage = {
  users: [...mockUsers],
  categories: [...mockCategories],
  budgets: [...mockBudgets],
  expenses: [...mockExpenses],
};


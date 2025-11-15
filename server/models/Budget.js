import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique constraint: one budget per user, category, month, year
budgetSchema.index({ userId: 1, categoryId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);


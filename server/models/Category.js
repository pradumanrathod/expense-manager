import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
categorySchema.index({ userId: 1 });

export default mongoose.model('Category', categorySchema);


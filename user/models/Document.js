import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Chung'
  },
  description: String,
  content: String,
  vectorId: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing'
  }
});

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
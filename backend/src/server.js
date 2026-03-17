import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import documentRoutes from './routes/documents.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file (for local development)
dotenv.config({ path: join(__dirname, '../.env') });

// Railway environment variables are already loaded, no need for .env file

// Tạo thư mục uploads nếu chưa có (cần thiết cho Railway)
const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Đã tạo thư mục uploads');
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://user-ashy-ten.vercel.app',
    'https://user-ashy-ten.vercel.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI hoặc MONGO_URL không được định nghĩa trong environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
  process.exit(1);
}

console.log('🔗 Đang kết nối MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Tăng timeout lên 30s
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API Đoàn Thanh Niên đang hoạt động',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      documents: '/api/documents',
      chat: '/api/chat'
    }
  });
});

app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server đang hoạt động' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại http://0.0.0.0:${PORT}`);
  console.log(`📡 PORT từ env: ${process.env.PORT || 'không có, dùng 8080'}`);
});

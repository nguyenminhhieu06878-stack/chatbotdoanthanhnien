import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocument, getAllDocuments, deleteDocument } from '../services/documentService.js';

const router = express.Router();

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Chỉ chấp nhận file: ${allowedTypes.join(', ')}`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload tài liệu
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Vui lòng chọn file' });
    }

    const document = await uploadDocument(file, { title, category, description });
    res.json({ message: 'Upload thành công', document });
  } catch (error) {
    console.error('Lỗi upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách tài liệu
router.get('/', async (req, res) => {
  try {
    const documents = await getAllDocuments();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy tài liệu theo ngày
router.get('/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const Document = (await import('../models/Document.js')).default;
    const documents = await Document.find({
      uploadedAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ uploadedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê tài liệu theo ngày
router.get('/stats/by-date', async (req, res) => {
  try {
    const Document = (await import('../models/Document.js')).default;
    
    // Lấy tất cả documents và group theo ngày
    const stats = await Document.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" }
          },
          count: { $sum: 1 },
          documents: { 
            $push: {
              id: "$_id",
              title: "$title",
              category: "$category",
              status: "$status"
            }
          }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 30 // Lấy 30 ngày gần nhất
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple endpoint to create sample documents in database
router.post('/create-samples', async (req, res) => {
  try {
    const Document = (await import('../models/Document.js')).default;
    
    // Create sample documents based on files in uploads directory
    const sampleDocs = [
      {
        title: 'Hướng dẫn tổ chức sự kiện',
        filename: 'sample-huong-dan-to-chuc-su-kien.txt',
        category: 'Hướng dẫn',
        content: 'Hướng dẫn chi tiết về cách tổ chức các sự kiện của Đoàn thanh niên...'
      },
      {
        title: 'Nhiệm vụ Ban chấp hành',
        filename: 'sample-nhiem-vu-ban-chap-hanh.txt', 
        category: 'Nhiệm vụ',
        content: 'Quy định về nhiệm vụ và trách nhiệm của Ban chấp hành Đoàn...'
      },
      {
        title: 'Nhiệm vụ Chi đoàn',
        filename: 'sample-nhiem-vu-chi-doan.txt',
        category: 'Nhiệm vụ', 
        content: 'Hướng dẫn về nhiệm vụ và hoạt động của Chi đoàn...'
      },
      {
        title: 'Ý tưởng hoạt động',
        filename: 'sample-y-tuong-hoat-dong.txt',
        category: 'Ý tưởng',
        content: 'Tổng hợp các ý tưởng hoạt động sáng tạo cho Đoàn thanh niên...'
      }
    ];

    let createdCount = 0;
    
    for (const docData of sampleDocs) {
      // Check if document already exists
      const existing = await Document.findOne({ filename: docData.filename });
      
      if (!existing) {
        const document = new Document({
          title: docData.title,
          filename: docData.filename,
          filepath: `uploads/${docData.filename}`,
          fileType: '.txt',
          category: docData.category,
          description: 'Sample document',
          content: docData.content,
          status: 'ready',
          uploadedAt: new Date()
        });
        
        await document.save();
        createdCount++;
      }
    }
    
    const totalDocs = await Document.countDocuments();
    
    res.json({
      message: `Created ${createdCount} sample documents`,
      totalDocuments: totalDocs
    });
    
  } catch (error) {
    console.error('Error creating samples:', error);
    res.status(500).json({ error: error.message });
  }
});

// Xóa tài liệu
router.delete('/:id', async (req, res) => {
  try {
    await deleteDocument(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

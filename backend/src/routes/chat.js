import express from 'express';
import { processChat } from '../services/chatService.js';

const router = express.Router();

// Test route để debug
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing chat service...');
    
    // Test simple response without AI
    res.json({
      status: 'success',
      message: 'Backend is working',
      timestamp: new Date().toISOString(),
      env: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasMongoUri: !!process.env.MONGODB_URI || !!process.env.MONGO_URL,
        chromaHost: process.env.CHROMA_HOST
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Simple test endpoint for chat
router.post('/simple', async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('📩 Simple test message:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
    }

    // Simple response without complex processing
    res.json({
      message: `Bạn đã hỏi: "${message}". Đây là phản hồi test từ backend.`,
      sources: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    res.status(500).json({ 
      error: 'Lỗi test đơn giản',
      details: error.message
    });
  }
});

router.post('/', async (req, res) => {
  // Add CORS headers manually
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { message, conversationHistory = [] } = req.body;
    
    console.log('📩 Nhận câu hỏi:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
    }

    // Add timeout and better error handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });

    const chatPromise = processChat(message, conversationHistory);
    
    const response = await Promise.race([chatPromise, timeoutPromise]);
    
    console.log('✅ Trả lời thành công');
    res.json(response);
  } catch (error) {
    console.error('❌ Lỗi chat:', error);
    console.error('Stack:', error.stack);
    
    // Trả về thông báo lỗi thân thiện
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Yêu cầu quá lâu. Vui lòng thử lại.';
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Không thể kết nối đến database. Vui lòng kiểm tra MongoDB và ChromaDB.';
    } else if (error.message.includes('API') || error.message.includes('GROQ')) {
      errorMessage = 'Lỗi kết nối AI service. Vui lòng kiểm tra Groq API key.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

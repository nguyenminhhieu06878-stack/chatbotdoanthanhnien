// Vercel serverless function for document upload with simplified approach
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return a helpful message about file upload limitations
    res.status(200).json({ 
      success: false,
      message: 'File upload qua Vercel có giới hạn kỹ thuật.',
      solution: {
        step1: 'Sử dụng Railway backend trực tiếp để upload',
        step2: 'Truy cập: https://chatbotdoanthanhnien-production.up.railway.app',
        step3: 'Hoặc liên hệ admin để được hỗ trợ upload file',
        note: 'Files đã upload sẽ được chatbot sử dụng ngay lập tức'
      },
      railwayUrl: 'https://chatbotdoanthanhnien-production.up.railway.app/api/documents/upload',
      temporaryWorkaround: 'Tính năng upload trên web đang được cải thiện'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Lỗi hệ thống: ' + error.message
    });
  }
}
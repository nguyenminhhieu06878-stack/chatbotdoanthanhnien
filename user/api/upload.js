// Vercel serverless function to proxy file upload
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    // For now, return a simple message since file upload through Vercel proxy is complex
    // In production, you might want to use direct Railway upload or cloud storage
    res.status(200).json({ 
      message: 'Upload feature đang được phát triển. Vui lòng sử dụng Railway backend trực tiếp để upload files.',
      suggestion: 'Truy cập Railway dashboard để upload documents.'
    });
  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload. Vui lòng thử lại.',
      details: error.message 
    });
  }
}
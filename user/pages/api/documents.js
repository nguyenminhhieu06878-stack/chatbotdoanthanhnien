// Vercel serverless function to proxy document requests
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

  try {
    let url = 'https://chatbotdoanthanhnien-production.up.railway.app/api/documents';
    
    // Handle different paths
    if (req.url && req.url !== '/api/documents') {
      const path = req.url.replace('/api/documents', '');
      url += path;
    }

    // Special handling for upload
    if (req.url && req.url.includes('/upload')) {
      if (req.method === 'POST') {
        // Return instructions for upload since Vercel proxy can't handle file uploads easily
        return res.status(200).json({ 
          success: false,
          message: 'Upload file qua Vercel proxy chưa được hỗ trợ đầy đủ.',
          instructions: {
            method1: 'Sử dụng Railway backend trực tiếp',
            method2: 'Hoặc upload file qua Railway dashboard',
            method3: 'Liên hệ admin để được hỗ trợ upload file'
          },
          railwayUploadUrl: 'https://chatbotdoanthanhnien-production.up.railway.app/api/documents/upload'
        });
      }
    }

    const fetchOptions = {
      method: req.method,
      headers: {},
    };

    // Handle different content types
    if (req.method !== 'GET') {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // For file uploads, we need to handle FormData differently
        // This is a simplified version - in production you might need more complex handling
        fetchOptions.body = JSON.stringify(req.body);
        fetchOptions.headers['Content-Type'] = 'application/json';
      } else {
        fetchOptions.body = JSON.stringify(req.body);
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, fetchOptions);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Response received' };
    }
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Documents proxy error:', error);
    res.status(500).json({ 
      error: 'Lỗi kết nối đến server. Vui lòng thử lại.',
      details: error.message 
    });
  }
}
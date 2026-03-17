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
    const { title, category, description, filename } = req.body;
    
    if (!title || !filename) {
      return res.status(400).json({ error: 'Title and filename are required' });
    }

    // Create a document record by calling Railway API
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://chatbotdoanthanhnien-production.up.railway.app/api/documents/create-samples', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Return success response
      res.status(200).json({
        message: 'Upload thành công',
        document: {
          title: title,
          filename: filename,
          category: category || 'Chung',
          description: description || '',
          status: 'ready'
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to create document' });
    }

  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ 
      error: 'Lỗi tạo tài liệu: ' + error.message
    });
  }
}
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
    // For now, just return success to test the endpoint
    res.status(200).json({
      message: 'Upload thành công',
      document: {
        title: 'Test Document',
        filename: 'test.txt',
        category: 'Test',
        status: 'ready'
      },
      note: 'This is a test response - actual upload functionality coming soon'
    });

  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload: ' + error.message,
      details: error.stack
    });
  }
}
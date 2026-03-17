// Disable body parser for raw body handling
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
    const railwayUrl = 'https://chatbotdoanthanhnien-production.up.railway.app/api/documents/upload';
    
    // Forward the request directly to Railway
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(railwayUrl, {
      method: 'POST',
      body: req,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
      },
    });

    const result = await response.text();
    
    // Forward the response
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(result);

  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload proxy: ' + error.message
    });
  }
}
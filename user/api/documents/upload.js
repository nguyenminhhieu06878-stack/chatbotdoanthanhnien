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
    // For now, just proxy the request to Railway backend
    const railwayUrl = 'https://chatbotdoanthanhnien-production.up.railway.app/api/documents/upload';
    
    // Forward the entire request to Railway
    const response = await fetch(railwayUrl, {
      method: 'POST',
      headers: {
        ...req.headers,
        host: undefined, // Remove host header to avoid conflicts
      },
      body: req.body,
    });

    const result = await response.text();
    
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(result);

  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload proxy: ' + error.message,
      suggestion: 'Thử upload trực tiếp tại: https://chatbotdoanthanhnien-production.up.railway.app'
    });
  }
}
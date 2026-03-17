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

  // Return a helpful response with instructions
  res.status(200).json({
    success: false,
    message: 'Upload file qua web interface',
    instruction: 'Để upload file, vui lòng sử dụng Railway backend trực tiếp',
    railwayUploadUrl: 'https://chatbotdoanthanhnien-production.up.railway.app/api/documents/upload',
    steps: [
      'Mở Railway backend trong tab mới',
      'Sử dụng Postman hoặc curl để upload',
      'Hoặc liên hệ admin để được hỗ trợ'
    ],
    note: 'File đã upload sẽ xuất hiện trong danh sách và chatbot có thể sử dụng ngay'
  });
}
import formidable from 'formidable';
import fs from 'fs';

// Disable body parser for file uploads
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
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file content
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Create FormData for Railway API
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', fileBuffer, {
      filename: file.originalFilename,
      contentType: file.mimetype,
    });
    
    // Add other fields
    if (fields.title?.[0]) formData.append('title', fields.title[0]);
    if (fields.category?.[0]) formData.append('category', fields.category[0]);
    if (fields.description?.[0]) formData.append('description', fields.description[0]);

    // Forward to Railway backend
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://chatbotdoanthanhnien-production.up.railway.app/api/documents/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const result = await response.json();
    
    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    if (response.ok) {
      res.status(200).json(result);
    } else {
      res.status(response.status).json(result);
    }

  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload: ' + error.message
    });
  }
}
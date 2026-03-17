import connectDB from '../lib/mongodb.js';
import Document from '../models/Document.js';

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
    await connectDB();

    if (req.method === 'GET') {
      // Get all documents
      const documents = await Document.find().sort({ uploadedAt: -1 });
      return res.status(200).json(documents);
    }

    if (req.method === 'POST') {
      // Create new document (for sample data)
      const { title, filename, filepath, fileType, category, description, content } = req.body;
      
      const document = new Document({
        title: title || filename,
        filename,
        filepath,
        fileType,
        category: category || 'Chung',
        description,
        content,
        status: 'ready'
      });
      
      await document.save();
      return res.status(201).json(document);
    }

    if (req.method === 'DELETE') {
      // Delete document
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      await Document.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Document deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Documents API error:', error);
    res.status(500).json({ 
      error: 'Lỗi server. Vui lòng thử lại.',
      details: error.message 
    });
  }
}
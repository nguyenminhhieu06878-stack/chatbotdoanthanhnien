import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { supabase } from '../lib/supabase.js';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromFile(file) {
  const ext = path.extname(file.originalFilename).toLowerCase();
  const buffer = fs.readFileSync(file.filepath);
  
  if (ext === '.pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (ext === '.txt') {
    return buffer.toString('utf-8');
  }
  
  throw new Error('Định dạng file không được hỗ trợ');
}

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
    console.log('Starting file upload...');
    
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    console.log('Parsed form data:', { fields: Object.keys(fields), files: Object.keys(files) });
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File info:', { 
      originalFilename: file.originalFilename, 
      size: file.size, 
      mimetype: file.mimetype 
    });

    // Extract text content from file
    const content = await extractTextFromFile(file);
    console.log('Extracted content length:', content.length);
    
    // Normalize filename để xử lý tiếng Việt đúng
    const normalizedFilename = file.originalFilename;
    
    // Upload file to Supabase Storage (optional - we can store content in database)
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = `${Date.now()}-${normalizedFilename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.warn('File upload to storage failed:', uploadError);
      // Continue without file storage - we have the content
    }

    // Save document metadata and content to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert([{
        title: fields.title?.[0] || normalizedFilename,
        filename: normalizedFilename,
        filepath: uploadData?.path || `/uploads/${fileName}`,
        file_type: path.extname(normalizedFilename),
        category: fields.category?.[0] || 'Chung',
        description: fields.description?.[0],
        content: content,
        status: 'ready',
        uploaded_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save document: ' + dbError.message });
    }

    console.log('Document saved to Supabase:', document.id);
    
    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        category: document.category,
        status: document.status,
        uploaded_at: document.uploaded_at
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload: ' + error.message,
      stack: error.stack
    });
  }
}
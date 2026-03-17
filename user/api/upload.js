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
  
  try {
    if (ext === '.pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (ext === '.doc') {
      // Try mammoth first for .doc files
      try {
        const result = await mammoth.extractRawText({ buffer });
        if (result.value && result.value.trim().length > 0) {
          return result.value;
        }
        throw new Error('Empty content from mammoth');
      } catch (mammothError) {
        console.warn('Mammoth failed for .doc file:', mammothError.message);
        // Fallback: return filename as content for .doc files that can't be read
        return `Nội dung file ${file.originalFilename} không thể đọc được. Vui lòng chuyển sang định dạng .docx hoặc .pdf để đảm bảo tương thích tốt nhất.`;
      }
    } else if (ext === '.txt') {
      return buffer.toString('utf-8');
    } else if (ext === '.json') {
      return buffer.toString('utf-8');
    }
    
    throw new Error(`Định dạng file ${ext} không được hỗ trợ. Chỉ hỗ trợ: .pdf, .docx, .doc, .txt, .json`);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    // Return a fallback content instead of throwing
    return `Lỗi đọc file ${file.originalFilename}: ${error.message}. File đã được lưu nhưng nội dung có thể không đầy đủ.`;
  }
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

    try {
      // Extract text content from file
      const content = await extractTextFromFile(file);
      console.log('Extracted content length:', content.length);
      
      // Normalize filename để xử lý tiếng Việt đúng
      const normalizedFilename = file.originalFilename;
      
      // Skip file storage for now - just save content to database
      // TODO: Create 'documents' bucket in Supabase Storage first
      
      // Save document metadata and content to database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert([{
          title: fields.title?.[0] || normalizedFilename,
          filename: normalizedFilename,
          filepath: `/uploads/${Date.now()}-${normalizedFilename}`, // Virtual path
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
        return res.status(500).json({ 
          error: 'Failed to save document to database: ' + dbError.message,
          details: dbError
        });
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

    } catch (processingError) {
      console.error('File processing error:', processingError);
      
      // Clean up temporary file
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
      
      return res.status(500).json({ 
        error: 'Failed to process file: ' + processingError.message,
        details: processingError.stack
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Lỗi upload: ' + error.message,
      stack: error.stack
    });
  }
}
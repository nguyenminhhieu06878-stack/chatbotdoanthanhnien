import { supabase } from '../lib/supabase.js';

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
    if (req.method === 'GET') {
      // Get all documents
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(documents);
    }

    if (req.method === 'POST') {
      // Create new document (for sample data)
      const { title, filename, filepath, fileType, category, description, content } = req.body;
      
      const { data: document, error } = await supabase
        .from('documents')
        .insert([{
          title: title || filename,
          filename,
          filepath,
          file_type: fileType,
          category: category || 'Chung',
          description,
          content,
          status: 'ready',
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(201).json(document);
    }

    if (req.method === 'DELETE') {
      // Delete document
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      
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
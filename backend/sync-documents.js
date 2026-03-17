// Script to sync existing files with database
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Document from './src/models/Document.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

async function syncDocuments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read uploads directory
    const uploadsDir = './uploads';
    const files = fs.readdirSync(uploadsDir);
    
    console.log(`📁 Found ${files.length} files in uploads directory`);

    for (const filename of files) {
      const filepath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filepath);
      
      // Check if document already exists in database
      const existingDoc = await Document.findOne({ filename });
      
      if (!existingDoc) {
        console.log(`📝 Adding ${filename} to database...`);
        
        // Read file content
        let content = '';
        try {
          if (filename.endsWith('.txt')) {
            content = fs.readFileSync(filepath, 'utf-8');
          } else {
            content = `Document: ${filename}`;
          }
        } catch (error) {
          content = `Document: ${filename} (content not readable)`;
        }

        // Create document record
        const document = new Document({
          title: filename.replace(/^\d+-\d+-/, ''), // Remove timestamp prefix
          filename: filename,
          filepath: filepath,
          fileType: path.extname(filename),
          category: filename.includes('sample-') ? 'Sample' : 'Chung',
          description: `Imported from uploads directory`,
          content: content,
          status: 'ready',
          uploadedAt: stats.birthtime || new Date()
        });

        await document.save();
        console.log(`✅ Added ${filename}`);
      } else {
        console.log(`⏭️  ${filename} already exists in database`);
      }
    }

    console.log('🎉 Sync completed!');
    
    // Show final count
    const totalDocs = await Document.countDocuments();
    console.log(`📊 Total documents in database: ${totalDocs}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

syncDocuments();
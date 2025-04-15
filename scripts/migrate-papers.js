const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  console.error('Please make sure your .env.local file contains the MONGODB_URI variable');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME) {
  console.error('Error: NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME environment variable is not set');
  console.error('Please make sure your .env.local file contains the NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME variable');
  process.exit(1);
}

async function migratePapers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const Paper = mongoose.model('Paper', new mongoose.Schema({
      title: String,
      abstract: String,
      status: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      conference: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference' },
      createdAt: Date,
    }));

    const papers = await Paper.find({ fileUrl: { $exists: false } });
    console.log(`Found ${papers.length} papers to migrate`);

    for (const paper of papers) {
      // Generate a default file URL based on the paper's ID
      const fileUrl = `https://f002.backblazeb2.com/file/${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME}/${paper._id}`;
      
      await Paper.findByIdAndUpdate(paper._id, { fileUrl });
      console.log(`Updated paper ${paper._id} with fileUrl: ${fileUrl}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migratePapers(); 
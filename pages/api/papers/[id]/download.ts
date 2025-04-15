import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/mongodb';
import { Paper } from '../../../../lib/models';
import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID!,
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting download process...');
    await dbConnect();
    console.log('Connected to database');

    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session ? 'Authenticated' : 'Not authenticated');

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const paper = await Paper.findById(req.query.id);
    console.log('Found paper:', paper ? 'Yes' : 'No');
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (!paper.fileUrl) {
      console.error('Paper has no file URL:', paper._id);
      return res.status(400).json({ message: 'Paper file not found' });
    }

    // Authorize with Backblaze
    console.log('Authorizing with Backblaze...');
    await b2.authorize();
    console.log('Backblaze authorization successful');

    // Get the file name from the URL
    const fileName = paper.fileUrl.split('/').pop();
    console.log('File name:', fileName);
    console.log('Full file URL:', paper.fileUrl);
    console.log('Bucket name:', process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME);
    
    if (!fileName) {
      return res.status(400).json({ message: 'Invalid file URL' });
    }

    // Get the full file path from the stored URL
    const filePath = paper.fileUrl.split('/file/')[1];
    console.log('Full file path:', filePath);

    // Get the download URL - use Backblaze's public download URL format
    const downloadUrl = `https://f002.backblazeb2.com/file/${filePath}`;
    console.log('Generated download URL:', downloadUrl);

    // Redirect to the download URL
    console.log('Redirecting to download URL...');
    res.redirect(downloadUrl);
  } catch (error) {
    console.error('Error in download endpoint:', error);
    const errorPaper = await Paper.findById(req.query.id);
    return res.status(500).json({ 
      message: 'Failed to generate download URL',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        filePath: errorPaper?.fileUrl?.split('/file/')[1],
        fileName: errorPaper?.fileUrl?.split('/').pop(),
        bucketName: process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME,
        fullUrl: errorPaper?.fileUrl
      }
    });
  }
} 
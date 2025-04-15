import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID!,
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { fileName, contentType, fileData } = req.body;

    console.log('Received upload request:', {
      fileName,
      contentType,
      hasFileData: !!fileData,
      fileDataLength: fileData?.length,
    });

    if (!fileName || !contentType || !fileData) {
      console.error('Missing required fields:', { fileName, contentType, hasFileData: !!fileData });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if environment variables are set
    if (!process.env.BACKBLAZE_APPLICATION_KEY_ID || !process.env.BACKBLAZE_APPLICATION_KEY || !process.env.BACKBLAZE_BUCKET_ID) {
      console.error('Missing Backblaze environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Authorize with Backblaze
    try {
      console.log('Authorizing with Backblaze...');
      await b2.authorize();
      console.log('Backblaze authorization successful');
    } catch (authError) {
      console.error('Backblaze authorization error:', authError);
      return res.status(500).json({ error: 'Failed to authorize with Backblaze' });
    }

    // Get upload URL
    try {
      console.log('Getting upload URL...');
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.BACKBLAZE_BUCKET_ID!,
      });
      console.log('Got upload URL successfully');

      // Generate a unique file name with user ID and timestamp
      const timestamp = Date.now();
      const uniqueFileName = `${session.user.id}/${timestamp}-${fileName}`;
      console.log('Generated unique filename:', uniqueFileName);

      // Convert base64 to buffer
      console.log('Converting file data to buffer...');
      const fileBuffer = Buffer.from(fileData.split(',')[1], 'base64');
      console.log('File buffer created, length:', fileBuffer.length);

      // Upload the file directly to the upload URL
      console.log('Uploading file to Backblaze...');
      const uploadResponse = await fetch(uploadUrlResponse.data.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': uploadUrlResponse.data.authorizationToken,
          'Content-Type': contentType,
          'X-Bz-File-Name': uniqueFileName,
          'X-Bz-Content-Sha1': 'do_not_verify',
        },
        body: fileBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadResponse.json();
      console.log('File uploaded successfully:', uploadData);

      const fileUrl = `https://f002.backblazeb2.com/file/${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME}/${uniqueFileName}`;
      console.log('Generated file URL:', fileUrl);

      return res.status(200).json({
        fileUrl,
      });
    } catch (uploadError) {
      console.error('Backblaze upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file to Backblaze' });
    }
  } catch (error) {
    console.error('General error in upload endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
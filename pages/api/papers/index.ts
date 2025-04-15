import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/mongodb';
import { Paper, Conference } from '../../../lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const { title, abstract, fileUrl, conferenceId } = req.body;

      console.log('Received paper creation request:', {
        title,
        abstract,
        fileUrl,
        conferenceId,
        userId: session.user.id,
      });

      if (!title || !abstract || !fileUrl || !conferenceId) {
        console.error('Missing required fields:', { title, abstract, fileUrl, conferenceId });
        return res.status(400).json({ message: 'Missing required fields' });
      }

      console.log('Creating paper record...');
      const paper = await Paper.create({
        title,
        abstract,
        fileUrl,
        conference: conferenceId,
        author: session.user.id,
        status: 'pending',
      });
      console.log('Paper created successfully:', paper);

      // Add the paper to the conference's papers array
      await Conference.findByIdAndUpdate(
        conferenceId,
        { $push: { papers: paper._id } }
      );
      console.log('Added paper to conference');

      return res.status(201).json(paper);
    } catch (error) {
      console.error('Error creating paper:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
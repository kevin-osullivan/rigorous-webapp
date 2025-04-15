import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/mongodb';
import { Conference, Paper } from '../../../lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'GET') {
      try {
        const conference = await Conference.findById(req.query.id).populate({
          path: 'papers',
          populate: {
            path: 'author',
            select: 'name email'
          }
        });

        if (!conference) {
          return res.status(404).json({ message: 'Conference not found' });
        }

        return res.status(200).json(conference);
      } catch (error) {
        console.error('Error fetching conference:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
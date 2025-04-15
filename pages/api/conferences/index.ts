import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/mongodb';
import { Conference } from '../../../lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    try {
      const conferences = await Conference.find().sort({ createdAt: -1 });
      return res.status(200).json(conferences);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const conference = await Conference.create(req.body);
      return res.status(201).json(conference);
    } catch (error) {
      console.error('Error creating conference:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
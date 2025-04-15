import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/mongodb';
import { Paper } from '../../../lib/models';
import { Conference } from '../../../lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const paperId = req.query.id;

  if (req.method === 'GET') {
    try {
      const paper = await Paper.findById(paperId).populate('author', 'name email');
      
      if (!paper) {
        return res.status(404).json({ message: 'Paper not found' });
      }

      return res.status(200).json(paper);
    } catch (error) {
      console.error('Error fetching paper:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const paper = await Paper.findById(paperId);
      
      if (!paper) {
        return res.status(404).json({ message: 'Paper not found' });
      }

      // Check if the user is the author of the paper
      if (paper.author.toString() !== session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to edit this paper' });
      }

      const { title, abstract, fileUrl } = req.body;

      // Update the paper
      const updatedPaper = await Paper.findByIdAndUpdate(
        paperId,
        { title, abstract, fileUrl },
        { new: true }
      );

      return res.status(200).json(updatedPaper);
    } catch (error) {
      console.error('Error updating paper:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const paper = await Paper.findById(paperId);
      
      if (!paper) {
        return res.status(404).json({ message: 'Paper not found' });
      }

      // Check if the user is the author of the paper
      if (paper.author.toString() !== session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this paper' });
      }

      // Delete the paper
      await Paper.findByIdAndDelete(paperId);

      // Remove the paper from the conference's papers array
      await Conference.findByIdAndUpdate(
        paper.conference,
        { $pull: { papers: paperId } }
      );

      return res.status(200).json({ message: 'Paper deleted successfully' });
    } catch (error) {
      console.error('Error deleting paper:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 
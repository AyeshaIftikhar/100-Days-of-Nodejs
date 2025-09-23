import { Request, Response } from 'express';
import User from '../models/user.model';
import { verifyProof } from '../utils/zkp.utils';

/**
 * Verify a zero-knowledge proof for authentication
 */
export const verifyAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, proof, publicSignals } = req.body;

    // Validate input
    if (!username || !proof || !publicSignals) {
      res.status(400).json({ error: 'Username, proof, and publicSignals are required' });
      return;
    }

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify that the public commitment matches what's stored in the database
    if (publicSignals[0] !== user.commitment) {
      res.status(401).json({ error: 'Invalid proof' });
      return;
    }

    // Verify the zero-knowledge proof
    const isValid = await verifyProof(publicSignals, proof);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid proof' });
      return;
    }

    // Authentication successful
    res.status(200).json({
      message: 'Authentication successful',
      username: user.username,
      token: generateToken(user.username) // In a real app, you'd use JWT here
    });
  } catch (error: unknown) {
    console.error('ZKP verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
};

/**
 * Simple token generator (in a real app, use JWT)
 */
function generateToken(username: string): string {
  // This is a placeholder - in a real app, use a proper JWT implementation
  return Buffer.from(username + ':' + Date.now().toString()).toString('base64');
}

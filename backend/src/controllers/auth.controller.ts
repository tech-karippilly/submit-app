import { Request, Response } from 'express';
import { login as loginService } from '../services/auth.services';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const tokens = await loginService({ email, password });

    res.status(200).json({
      message: 'Login successful',
      ...tokens,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
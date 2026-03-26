import { Request, Response, NextFunction } from 'express';
import { getAbout, updateAbout } from '../services/about.services';

export const get = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const about = await getAbout();

    res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const about = await updateAbout(req.body);

    res.status(200).json({
      success: true,
      message: 'About page content updated successfully',
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { getHero, updateHero } from '../services/hero.services';

export const get = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hero = await getHero();

    res.status(200).json({
      success: true,
      data: hero,
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
    const hero = await updateHero(req.body);

    res.status(200).json({
      success: true,
      message: 'Hero section updated successfully',
      data: hero,
    });
  } catch (error) {
    next(error);
  }
};

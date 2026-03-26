import { Request, Response, NextFunction } from 'express';
import {
  createSponsor,
  getAllSponsors,
  getSponsorsByTier,
  getSponsorsByType,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
  toggleSponsorStatus,
} from '../services/sponsor.services';
import { SponsorTier, SponsorType } from '../models/Sponsor';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sponsor = await createSponsor(req.body);

    res.status(201).json({
      success: true,
      message: 'Sponsor/Partner created successfully',
      data: sponsor,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tier, type, isActive } = req.query;
    
    const filter: { tier?: SponsorTier; type?: SponsorType; isActive?: boolean } = {};
    
    if (tier && ['diamond', 'platinum', 'gold'].includes(tier as string)) {
      filter.tier = tier as SponsorTier;
    }
    if (type && ['sponsor', 'partner'].includes(type as string)) {
      filter.type = type as SponsorType;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const sponsors = await getAllSponsors(Object.keys(filter).length > 0 ? filter : undefined);

    res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors,
    });
  } catch (error) {
    next(error);
  }
};

export const getByTier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tier } = req.params;

    if (!['diamond', 'platinum', 'gold'].includes(tier)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tier. Must be "diamond", "platinum", or "gold"',
      });
      return;
    }

    const sponsors = await getSponsorsByTier(tier as SponsorTier);

    res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors,
    });
  } catch (error) {
    next(error);
  }
};

export const getByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.params;

    if (!['sponsor', 'partner'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "sponsor" or "partner"',
      });
      return;
    }

    const sponsors = await getSponsorsByType(type as SponsorType);

    res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const sponsor = await getSponsorById(id);

    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor/Partner not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: sponsor,
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
    const { id } = req.params;
    const sponsor = await updateSponsor(id, req.body);

    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor/Partner not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Sponsor/Partner updated successfully',
      data: sponsor,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteSponsor(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Sponsor/Partner not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Sponsor/Partner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const sponsor = await toggleSponsorStatus(id);

    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: 'Sponsor/Partner not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Sponsor/Partner ${sponsor.isActive ? 'activated' : 'deactivated'} successfully`,
      data: sponsor,
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { getContact, updateContact } from '../services/contact.services';

export const get = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contact = await getContact();

    res.status(200).json({
      success: true,
      data: contact,
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
    const contact = await updateContact(req.body);

    res.status(200).json({
      success: true,
      message: 'Contact details updated successfully',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

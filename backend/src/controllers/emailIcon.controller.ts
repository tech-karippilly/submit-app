import { Request, Response } from 'express';
import * as emailIconService from '../services/emailIcon.services';
import { EmailIconCategory } from '../models/EmailIcon';

// Get all email icons
export const getAllEmailIcons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const icons = await emailIconService.getAllEmailIcons(category as EmailIconCategory);
    res.status(200).json({
      success: true,
      count: icons.length,
      data: icons,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email icons';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

// Get email icon by ID
export const getEmailIconById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const icon = await emailIconService.getEmailIconById(id);

    if (!icon) {
      res.status(404).json({
        success: false,
        message: 'Email icon not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: icon,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email icon';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

// Create email icon
export const createEmailIcon = async (req: Request, res: Response): Promise<void> => {
  try {
    const icon = await emailIconService.createEmailIcon(req.body);
    res.status(201).json({
      success: true,
      message: 'Email icon created successfully',
      data: icon,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create email icon';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// Update email icon
export const updateEmailIcon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const icon = await emailIconService.updateEmailIcon(id, req.body);

    if (!icon) {
      res.status(404).json({
        success: false,
        message: 'Email icon not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email icon updated successfully',
      data: icon,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update email icon';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// Delete email icon
export const deleteEmailIcon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await emailIconService.deleteEmailIcon(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Email icon not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email icon deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete email icon';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

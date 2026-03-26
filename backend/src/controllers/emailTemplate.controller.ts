import { Request, Response } from 'express';
import * as emailTemplateService from '../services/emailTemplate.services';

// Get all email templates
export const getAllEmailTemplates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = await emailTemplateService.getAllEmailTemplates();
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email templates';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

// Get email template by ID
export const getEmailTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await emailTemplateService.getEmailTemplateById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch email template';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

// Create email template
export const createEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const template = await emailTemplateService.createEmailTemplate(req.body);
    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create email template';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// Update email template
export const updateEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await emailTemplateService.updateEmailTemplate(id, req.body);

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email template updated successfully',
      data: template,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update email template';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// Delete email template
export const deleteEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await emailTemplateService.deleteEmailTemplate(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete email template';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

// Toggle email template status
export const toggleEmailTemplateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await emailTemplateService.toggleEmailTemplateStatus(id);

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Email template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      data: template,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle email template status';
    res.status(500).json({
      success: false,
      message,
    });
  }
};

import { Router } from 'express';
import * as emailTemplateController from '../controllers/emailTemplate.controller';
import { ROUTE } from '../constant/routes';

const router = Router();

// @route   GET /v1/api/email-template
// @desc    Get all email templates
// @access  Private (Admin)
router.get(ROUTE.EMAIL_TEMPLATE.GET_ALL, emailTemplateController.getAllEmailTemplates);

// @route   GET /v1/api/email-template/:id
// @desc    Get email template by ID
// @access  Private (Admin)
router.get(ROUTE.EMAIL_TEMPLATE.GET_BY_ID, emailTemplateController.getEmailTemplateById);

// @route   POST /v1/api/email-template
// @desc    Create email template
// @access  Private (Admin)
router.post(ROUTE.EMAIL_TEMPLATE.CREATE, emailTemplateController.createEmailTemplate);

// @route   PUT /v1/api/email-template/:id
// @desc    Update email template
// @access  Private (Admin)
router.put(ROUTE.EMAIL_TEMPLATE.UPDATE, emailTemplateController.updateEmailTemplate);

// @route   DELETE /v1/api/email-template/:id
// @desc    Delete email template
// @access  Private (Admin)
router.delete(ROUTE.EMAIL_TEMPLATE.DELETE, emailTemplateController.deleteEmailTemplate);

// @route   PATCH /v1/api/email-template/:id/toggle
// @desc    Toggle email template status
// @access  Private (Admin)
router.patch(ROUTE.EMAIL_TEMPLATE.TOGGLE_STATUS, emailTemplateController.toggleEmailTemplateStatus);

export default router;

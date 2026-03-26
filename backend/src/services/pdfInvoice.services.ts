import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

export interface InvoicePDFData {
  invoiceNumber: string;
  invoiceId: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  amount: number;
  transactionId: string;
  transactionDate: string;
  attendeeType: 'student' | 'professional';
  isGroup: boolean;
  groupSize?: number;
}

// Generate PDF invoice buffer
export const generateInvoicePDF = async (data: InvoicePDFData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      const stream = new PassThrough();

      doc.pipe(stream);

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      // Colors
      const primaryColor = '#065f46'; // Emerald dark
      const goldColor = '#D4AF37';
      const textColor = '#333333';

      // Header Background
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      // Company Name
      doc.fillColor('#FFFFFF')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('SUMMIT', 50, 35);

      doc.fillColor(goldColor)
        .fontSize(10)
        .text('Excellence in Every Experience', 50, 65);

      // Invoice Title
      doc.fillColor('#FFFFFF')
        .fontSize(24)
        .text('INVOICE', 400, 40, { align: 'right', width: 150 });

      // Invoice Number
      doc.fillColor(goldColor)
        .fontSize(10)
        .text(data.invoiceNumber, 400, 70, { align: 'right', width: 150 });

      // Reset position after header
      let y = 150;

      // Invoice Details Box
      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Invoice Details', 50, y);

      y += 20;

      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#666666');

      doc.text('Invoice ID:', 50, y);
      doc.fillColor(textColor).text(data.invoiceNumber, 150, y);

      doc.fillColor('#666666').text('Transaction ID:', 300, y);
      doc.fillColor(textColor).text(data.transactionId, 400, y);

      y += 15;

      doc.fillColor('#666666').text('Invoice Date:', 50, y);
      doc.fillColor(textColor).text(data.transactionDate, 150, y);

      doc.fillColor('#666666').text('Status:', 300, y);
      doc.fillColor('#059669').text('PAID', 400, y);

      y += 30;

      // Divider
      doc.strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .stroke();

      y += 20;

      // Bill To Section
      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('BILL TO', 50, y);

      y += 15;

      doc.font('Helvetica')
        .fontSize(10)
        .fillColor(textColor)
        .text(data.participantName, 50, y);

      y += 12;

      doc.fillColor('#666666')
        .text(data.participantEmail, 50, y);

      y += 12;

      doc.text(data.participantPhone, 50, y);

      y += 12;

      if (data.isGroup && data.groupSize) {
        doc.text(`Group Registration (${data.groupSize} members)`, 50, y);
        y += 12;
      }

      doc.text(`Attendee Type: ${data.attendeeType === 'student' ? 'Student' : 'Professional'}`, 50, y);

      y += 30;

      // Event Details Section
      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('EVENT DETAILS', 50, y);

      y += 15;

      doc.font('Helvetica')
        .fontSize(10)
        .fillColor('#666666');

      doc.text('Event:', 50, y);
      doc.fillColor(textColor).text(data.eventName, 150, y);

      y += 12;

      doc.fillColor('#666666').text('Date:', 50, y);
      doc.fillColor(textColor).text(data.eventDate, 150, y);

      y += 12;

      doc.fillColor('#666666').text('Location:', 50, y);
      doc.fillColor(textColor).text(data.eventLocation, 150, y);

      y += 40;

      // Amount Table
      const tableTop = y;
      const tableLeft = 50;
      const tableWidth = doc.page.width - 100;

      // Table Header
      doc.fillColor(primaryColor)
        .rect(tableLeft, tableTop, tableWidth, 25)
        .fill();

      doc.fillColor('#FFFFFF')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', tableLeft + 10, tableTop + 8);

      doc.text('Amount', tableLeft + tableWidth - 100, tableTop + 8, { width: 80, align: 'right' });

      y = tableTop + 25;

      // Table Row
      doc.fillColor('#F9FAFB')
        .rect(tableLeft, y, tableWidth, 30)
        .fill();

      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(data.eventName, tableLeft + 10, y + 10);

      doc.text(`Rs. ${data.amount.toLocaleString('en-IN')}`, tableLeft + tableWidth - 100, y + 10, { width: 80, align: 'right' });

      y += 30;

      // Total Row
      doc.fillColor('#F3F4F6')
        .rect(tableLeft, y, tableWidth, 30)
        .fill();

      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL', tableLeft + 10, y + 10);

      doc.fillColor(primaryColor)
        .fontSize(12)
        .text(`Rs. ${data.amount.toLocaleString('en-IN')}`, tableLeft + tableWidth - 100, y + 8, { width: 80, align: 'right' });

      y += 60;

      // Footer
      doc.fillColor('#666666')
        .fontSize(8)
        .font('Helvetica')
        .text('This is a computer-generated invoice and does not require a signature.', 50, y, { align: 'center', width: doc.page.width - 100 });

      y += 15;

      doc.text('For any queries, please contact: contact@summit.org.in', 50, y, { align: 'center', width: doc.page.width - 100 });

      y += 30;

      // Footer Border
      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(primaryColor);

      doc.fillColor('#FFFFFF')
        .fontSize(8)
        .text('© 2026 Summit. All rights reserved.', 50, doc.page.height - 35, { align: 'center', width: doc.page.width - 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

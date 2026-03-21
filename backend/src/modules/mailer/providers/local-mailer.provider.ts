import { Injectable, Logger } from '@nestjs/common';
import { IMailerProvider, SendEmailOptions } from '../interfaces/mailer-provider.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class LocalMailerProvider implements IMailerProvider {
  private readonly logger = new Logger(LocalMailerProvider.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Basic SMTP configuration. In a real app, these should also come from ConfigService
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT, 10) || 2525,
      auth: {
        user: process.env.SMTP_USER || 'your_mailtrap_user',
        pass: process.env.SMTP_PASS || 'your_mailtrap_pass',
      },
    });
    this.logger.log('Local/SMTP Mailer Provider Initialized');
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from || '"Trucking App" <noreply@truckingapp.local>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email via SMTP: ${error.message}`, error.stack);
      throw error;
    }
  }
}

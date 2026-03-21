import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { IMailerProvider, SendEmailOptions } from '../interfaces/mailer-provider.interface';

@Injectable()
export class SendGridMailerProvider implements IMailerProvider {
  private readonly logger = new Logger(SendGridMailerProvider.name);

  constructor() {
    this.logger.log('SendGrid Mailer Provider Initialized (Skeleton)');
    // Initialize @sendgrid/mail here
    // e.g., sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    this.logger.debug(`[SendGrid Simulation] Sending email to: ${options.to}`);
    throw new NotImplementedException('SendGrid sendEmail not fully implemented yet');
  }
}

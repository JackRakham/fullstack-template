import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { IMailerProvider, SendEmailOptions } from '../interfaces/mailer-provider.interface';

@Injectable()
export class SesMailerProvider implements IMailerProvider {
  private readonly logger = new Logger(SesMailerProvider.name);

  constructor() {
    this.logger.log('AWS SES Mailer Provider Initialized (Skeleton)');
    // Initialize @aws-sdk/client-ses here
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    this.logger.debug(`[AWS SES Simulation] Sending email to: ${options.to}`);
    throw new NotImplementedException('AWS SES sendEmail not fully implemented yet');
  }
}

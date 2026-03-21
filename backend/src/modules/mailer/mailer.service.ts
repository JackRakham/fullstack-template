import { Injectable, Inject, Logger } from '@nestjs/common';
import { IMailerProvider, SendEmailOptions } from './interfaces/mailer-provider.interface';
import { MAILER_PROVIDER_TOKEN, MAIL_QUEUE } from './mailer.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @Inject(MAILER_PROVIDER_TOKEN)
    private readonly mailerProvider: IMailerProvider,
    @InjectQueue(MAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  /**
   * Raw delegate method
   */
  async sendGenericEmail(options: SendEmailOptions): Promise<void> {
    this.logger.debug(`Queueing generic email to ${options.to}`);
    await this.mailQueue.add('sendEmail', options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Business Logic Method: Send Welcome Email
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    this.logger.log(`Dispatching welcome email to: ${userEmail}`);
    
    const subject = `Welcome to Trucking App, ${userName}!`;
    const text = `Hi ${userName},\n\nWelcome to our platform. We are excited to have you on board!`;
    const html = `<h1>Hi ${userName},</h1><p>Welcome to our platform. We are excited to have you on board!</p>`;

    await this.sendGenericEmail({
      to: userEmail,
      subject,
      text,
      html,
    });
  }

  /**
   * Business Logic Method: Send Password Reset
   */
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void> {
    this.logger.log(`Dispatching password reset to: ${userEmail}`);
    
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const subject = `Password Reset Request`;
    const text = `You requested a password reset. Please click this link: ${resetUrl}`;
    const html = `<p>You requested a password reset. <a href="${resetUrl}">Click here to reset your password</a>.</p>`;

    await this.sendGenericEmail({
      to: userEmail,
      subject,
      text,
      html,
    });
  }
}

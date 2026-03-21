import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { IMailerProvider, SendEmailOptions } from '../interfaces/mailer-provider.interface';
import { MAILER_PROVIDER_TOKEN, MAIL_QUEUE } from '../mailer.constants';

@Processor(MAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(MAILER_PROVIDER_TOKEN)
    private readonly mailerProvider: IMailerProvider,
  ) {
    super();
  }

  async process(job: Job<SendEmailOptions>): Promise<any> {
    const { to, subject } = job.data;
    this.logger.log(`Processing email job ${job.id} for ${to}: ${subject}`);

    try {
      await this.mailerProvider.sendEmail(job.data);
      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error; // Re-throw to allow BullMQ to handle retries
    }
  }
}

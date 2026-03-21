import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ConfigKey } from 'src/config/config.keys';
import { LocalMailerProvider } from './providers/local-mailer.provider';
import { SendGridMailerProvider } from './providers/sendgrid-mailer.provider';
import { SesMailerProvider } from './providers/ses-mailer.provider';
import { MailerService } from './mailer.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './processors/email.processor';
import { MAILER_PROVIDER_TOKEN, MAIL_QUEUE } from './mailer.constants';

const mailerProviderFactory = {
  provide: MAILER_PROVIDER_TOKEN,
  useFactory: (configService: ConfigService) => {
    const providerType = configService.get<string>(ConfigKey.MAILER_PROVIDER) || 'local';
    const logger = new Logger('MailerModule');

    switch (providerType) {
      case 'sendgrid':
        logger.log('Selecting SendGrid Mailer Provider');
        return new SendGridMailerProvider();
      case 'ses':
        logger.log('Selecting AWS SES Mailer Provider');
        return new SesMailerProvider();
      case 'local':
      default:
        logger.log('Selecting Local/SMTP Mailer Provider');
        return new LocalMailerProvider();
    }
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [mailerProviderFactory, MailerService, EmailProcessor],
  exports: [MAILER_PROVIDER_TOKEN, MailerService, BullModule],
})
export class MailerModule { }

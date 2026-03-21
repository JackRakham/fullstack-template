import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserNotificationsModule } from './user-notifications/user-notifications.module';

@Module({
  imports: [EmailModule, WhatsappModule, NotificationsModule, UserNotificationsModule]
})
export class NotificationModule { }

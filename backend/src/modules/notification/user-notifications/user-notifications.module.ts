import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotificationsService } from './user-notifications.service';
import { UserNotificationsController } from './user-notifications.controller';
import { UserNotificationEntity } from './user-notification.entity';
import { UserEntity } from 'src/modules/identity/users/user.entity';
import { NotificationEntity } from '../notifications/notification.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserNotificationEntity,
      UserEntity,
      NotificationEntity
    ]),
    SharedModule
  ],
  providers: [UserNotificationsService],
  controllers: [UserNotificationsController],
  exports: [UserNotificationsService]
})
export class UserNotificationsModule {}

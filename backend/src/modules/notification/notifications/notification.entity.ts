import { BaseEntity } from "src/shared/models/base-entity";
import { Column, Entity, OneToMany } from "typeorm";
import { UserNotificationEntity } from "../user-notifications/user-notification.entity";

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
    @Column()
    title: string;

    @Column()
    description: string;

    @OneToMany(() => UserNotificationEntity, (userNotification) => userNotification.notification)
    user_notifications: UserNotificationEntity[];
}
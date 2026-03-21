import { BaseEntity } from "src/shared/models/base-entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { NotificationEntity } from "../notifications/notification.entity";
import { UserEntity } from "src/modules/identity/users/user.entity";

@Entity('user_notifications')
export class UserNotificationEntity extends BaseEntity {
    @Column()
    readed: boolean;

    @ManyToOne(() => UserEntity, (user) => user.user_notifications)
    user: UserEntity;

    @ManyToOne(() => NotificationEntity, (notification) => notification.user_notifications)
    notification: NotificationEntity;
}
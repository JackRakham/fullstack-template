import { Auditable } from "src/modules/audit/decorators/auditable.decorator";
import { UserNotificationEntity } from "src/modules/notification/user-notifications/user-notification.entity";
import { BaseEntity } from "src/shared/models/base-entity";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { MediaEntity } from "src/modules/storage/entities/media.entity";
import { UserType } from "src/shared/models/enums/user-type.enum";
import { RoleEntity } from "../roles/role.entity";

@Auditable()
@Entity('users')
export class UserEntity extends BaseEntity {
    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ select: false })
    password: string;

    @OneToMany(() => UserNotificationEntity, (user_notification) => user_notification.user)
    user_notifications: UserNotificationEntity[];

    @Column({ nullable: true, select: false })
    hashed_refresh_token: string;

    @Column({ nullable: true })
    avatar_url: string;

    @ManyToOne(() => MediaEntity, { nullable: true })
    @JoinColumn({ name: 'avatar_id' })
    avatar: MediaEntity;

    @Column({ nullable: true })
    avatar_id: number;

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.CLIENT,
        select: false,
    })
    user_type: UserType;

    @ManyToMany(() => RoleEntity, (role) => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: RoleEntity[];
}
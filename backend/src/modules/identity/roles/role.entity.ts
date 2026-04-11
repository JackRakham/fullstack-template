import { BaseEntity } from "src/shared/models/base-entity";
import { Column, Entity, ManyToMany } from "typeorm";
import { PermissionEntity } from "../permissions/permission.entity";
import { UserEntity } from "../users/user.entity";

@Entity('roles')
export class RoleEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => PermissionEntity, permission => permission.roles)
    permissions: PermissionEntity[];

    @ManyToMany(() => UserEntity, user => user.roles)
    users: UserEntity[];
}
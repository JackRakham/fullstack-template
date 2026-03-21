import { BaseEntity } from "src/shared/models/base-entity";
import { Column, Entity, ManyToMany } from "typeorm";
import { RoleEntity } from "../roles/role.entity";

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => RoleEntity, role => role.permissions)
    roles: RoleEntity[];
}
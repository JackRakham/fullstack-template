import { Module } from '@nestjs/common';
import { PermissionRolesController } from './permission-roles.controller';
import { PermissionRolesService } from './permission-roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '../../permissions/permission.entity';
import { RoleEntity } from '../../roles/role.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity]),
    SharedModule
  ],
  controllers: [PermissionRolesController],
  providers: [PermissionRolesService]
})
export class PermissionRolesModule { }

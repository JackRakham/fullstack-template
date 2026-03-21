import { Module } from '@nestjs/common';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionsService } from './role-permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../../roles/role.entity';
import { PermissionEntity } from '../../permissions/permission.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity]),
    SharedModule
  ],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService]
})
export class RolePermissionsModule { }

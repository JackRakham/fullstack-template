import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './relationships/role-permissions/role-permissions.module';
import { PermissionRolesModule } from './relationships/permission-roles/permission-roles.module';
import { AuthModule } from './auth/auth.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [UsersModule, RolesModule, PermissionsModule, RolePermissionsModule, PermissionRolesModule, AuthModule, IntegrationsModule]
})
export class IdentityModule { }

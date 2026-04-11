import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './relationships/role-permissions/role-permissions.module';
import { PermissionRolesModule } from './relationships/permission-roles/permission-roles.module';
import { AuthModule } from './auth/auth.module';
import { IntegrationsModule } from './integrations/integrations.module';

import { UserRolesModule } from './relationships/user-roles/user-roles.module';
import { RoleUsersModule } from './relationships/role-users/role-users.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    PermissionRolesModule,
    UserRolesModule,
    RoleUsersModule,
    AuthModule,
    IntegrationsModule
  ]
})
export class IdentityModule { }


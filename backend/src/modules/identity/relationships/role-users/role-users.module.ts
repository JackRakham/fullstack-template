import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../users/user.entity';
import { RoleEntity } from '../../roles/role.entity';
import { RoleUsersController } from './role-users.controller';
import { RoleUsersService } from './role-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  providers: [RoleUsersService],
  controllers: [RoleUsersController],
  exports: [RoleUsersService],
})
export class RoleUsersModule { }

import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { RoleUsersService } from './role-users.service';
import { AssociateUsersDto } from '../../dtos/role-user.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { UserResponseDto } from '../../dtos/user.dto';

@ApiTags('Role-Users')
@ApiExtraModels(PaginationDto)
@Controller('roles')
export class RoleUsersController {
    constructor(private readonly service: RoleUsersService) {}

    @Post(':roleId/users/:userId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Add a user to a role' })
    addUserToRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        return this.service.addUserToRole(roleId, userId);
    }

    @Get(':roleId/users')
    @ApiOperation({ summary: 'Get all users for a role' })
    @ApiResponse({ status: 200, description: 'Return paginated users', type: [UserResponseDto] })
    findUsersByRoleId(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Query() pagination: PaginationDto,
    ): Promise<PaginatedResponseDto<UserResponseDto>> {
        return this.service.findUsersByRoleId(roleId, pagination);
    }

    @Post(':roleId/users')
    @HttpCode(204)
    @ApiOperation({ summary: 'Replace all users for a role' })
    associateUsersToRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Body() dto: AssociateUsersDto,
    ) {
        return this.service.associateUsersToRole(roleId, dto.userIds);
    }

    @Delete(':roleId/users/:userId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove a user from a role' })
    removeUserFromRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        return this.service.removeUserFromRole(roleId, userId);
    }
}

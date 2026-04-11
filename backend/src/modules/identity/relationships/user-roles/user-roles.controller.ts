import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { AssociateRolesDto } from '../../dtos/user-role.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { RoleResponseDto } from '../../dtos/role.dto';

@ApiTags('User-Roles')
@ApiExtraModels(PaginationDto)
@Controller('users')
export class UserRolesController {
    constructor(private readonly service: UserRolesService) {}

    @Post(':userId/roles/:roleId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Add a role to a user' })
    addRoleToUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.service.addRoleToUser(userId, roleId);
    }

    @Get(':userId/roles')
    @ApiOperation({ summary: 'Get all roles for a user' })
    @ApiResponse({ status: 200, description: 'Return paginated roles', type: [RoleResponseDto] })
    findRolesByUserId(
        @Param('userId', ParseIntPipe) userId: number,
        @Query() pagination: PaginationDto,
    ): Promise<PaginatedResponseDto<RoleResponseDto>> {
        return this.service.findRolesByUserId(userId, pagination);
    }

    @Post(':userId/roles')
    @HttpCode(204)
    @ApiOperation({ summary: 'Replace all roles for a user' })
    associateRolesToUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: AssociateRolesDto,
    ) {
        return this.service.associateRolesToUser(userId, dto.roleIds);
    }

    @Delete(':userId/roles/:roleId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove a role from a user' })
    removeRoleFromUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.service.removeRoleFromUser(userId, roleId);
    }
}

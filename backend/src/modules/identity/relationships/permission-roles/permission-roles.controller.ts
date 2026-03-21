import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { PermissionRolesService } from './permission-roles.service';
import { AssociateRolesDto } from '../../dtos/role-permission.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { RoleResponseDto } from '../../dtos/role.dto';

@ApiTags('Permission Roles')
@ApiExtraModels(PaginationDto)
@Controller('permissions')
export class PermissionRolesController {
    constructor(private readonly permissionRolesService: PermissionRolesService) {}

    @Post(':permissionId/roles/:roleId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Add a role to a permission' })
    addRoleToPermission(
        @Param('permissionId', ParseIntPipe) permissionId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.permissionRolesService.addRoleToPermission(permissionId, roleId);
    }

    @Get(':permissionId/roles')
    @ApiOperation({ summary: 'Get all roles for a permission' })
    @ApiResponse({ status: 200, description: 'Return paginated roles', type: [RoleResponseDto] })
    findRolesByPermissionId(
        @Param('permissionId', ParseIntPipe) permissionId: number,
        @Query() pagination: PaginationDto,
    ): Promise<PaginatedResponseDto<RoleResponseDto>> {
        return this.permissionRolesService.findRolesByPermissionId(permissionId, pagination);
    }

    @Post(':permissionId/roles')
    @HttpCode(204)
    @ApiOperation({ summary: 'Replace all roles for a permission' })
    associateRolesToPermission(
        @Param('permissionId', ParseIntPipe) permissionId: number,
        @Body() dto: AssociateRolesDto,
    ) {
        return this.permissionRolesService.associateRolesToPermission(permissionId, dto.roleIds);
    }

    @Delete(':permissionId/roles/:roleId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove a role from a permission' })
    removeRoleFromPermission(
        @Param('permissionId', ParseIntPipe) permissionId: number,
        @Param('roleId', ParseIntPipe) roleId: number,
    ) {
        return this.permissionRolesService.removeRoleFromPermission(permissionId, roleId);
    }
}

import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { RolePermissionsService } from './role-permissions.service';
import { AssociatePermissionsDto } from '../../dtos/role-permission.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { PermissionResponseDto } from '../../dtos/permission.dto';

@ApiTags('Role Permissions')
@ApiExtraModels(PaginationDto)
@Controller('roles')
export class RolePermissionsController {
    constructor(private readonly rolePermissionsService: RolePermissionsService) {}

    @Post(':roleId/permissions/:permissionId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Add a permission to a role' })
    addPermissionToRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Param('permissionId', ParseIntPipe) permissionId: number,
    ) {
        return this.rolePermissionsService.addPermissionToRole(roleId, permissionId);
    }

    @Get(':roleId/permissions')
    @ApiOperation({ summary: 'Get all permissions for a role' })
    @ApiResponse({ status: 200, description: 'Return paginated permissions', type: [PermissionResponseDto] })
    findPermissionsByRoleId(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Query() pagination: PaginationDto,
    ): Promise<PaginatedResponseDto<PermissionResponseDto>> {
        return this.rolePermissionsService.findPermissionsByRoleId(roleId, pagination);
    }

    @Post(':roleId/permissions')
    @HttpCode(204)
    @ApiOperation({ summary: 'Replace all permissions for a role' })
    associatePermissionsToRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Body() dto: AssociatePermissionsDto,
    ) {
        return this.rolePermissionsService.associatePermissionsToRole(roleId, dto.permissionIds);
    }

    @Delete(':roleId/permissions/:permissionId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove a permission from a role' })
    removePermissionFromRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Param('permissionId', ParseIntPipe) permissionId: number,
    ) {
        return this.rolePermissionsService.removePermissionFromRole(roleId, permissionId);
    }
}

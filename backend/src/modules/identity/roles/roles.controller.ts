import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from '../dtos/role.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@ApiTags('Roles')
@ApiExtraModels(PaginationDto)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, type: RoleResponseDto })
    create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
        return this.rolesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all roles paginated' })
    @ApiResponse({ status: 200, description: 'Return all roles paginated.' })
    findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
        return this.rolesService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a role by ID' })
    @ApiResponse({ status: 200, type: RoleResponseDto })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
        return this.rolesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a role' })
    @ApiResponse({ status: 200, type: RoleResponseDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto): Promise<RoleResponseDto> {
        return this.rolesService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a role' })
    @ApiResponse({ status: 204 })
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.rolesService.delete(id);
    }
}

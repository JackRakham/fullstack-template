import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto } from '../dtos/permission.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@ApiTags('Permissions')
@ApiExtraModels(PaginationDto)
@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new permission' })
    @ApiResponse({ status: 201, type: PermissionResponseDto })
    create(@Body() dto: CreatePermissionDto): Promise<PermissionResponseDto> {
        return this.permissionsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all permissions paginated' })
    @ApiResponse({ status: 200, description: 'Return all permissions paginated.' })
    findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<PermissionResponseDto>> {
        return this.permissionsService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a permission by ID' })
    @ApiResponse({ status: 200, type: PermissionResponseDto })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
        return this.permissionsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a permission' })
    @ApiResponse({ status: 200, type: PermissionResponseDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto): Promise<PermissionResponseDto> {
        return this.permissionsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a permission' })
    @ApiResponse({ status: 204 })
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.permissionsService.delete(id);
    }
}

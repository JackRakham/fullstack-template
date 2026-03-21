import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { TrucksService } from './trucks.service';
import { CreateTruckDto, UpdateTruckDto, TruckResponseDto } from '../dtos/truck.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@ApiTags('Trucks')
@ApiExtraModels(PaginationDto)
@Controller('trucks')
export class TrucksController {
    constructor(private readonly trucksService: TrucksService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new truck' })
    @ApiResponse({ status: 201, type: TruckResponseDto })
    create(@Body() dto: CreateTruckDto): Promise<TruckResponseDto> {
        return this.trucksService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all trucks paginated' })
    @ApiResponse({ status: 200, description: 'Return all trucks paginated.' })
    findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<TruckResponseDto>> {
        return this.trucksService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a truck by ID' })
    @ApiResponse({ status: 200, type: TruckResponseDto })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<TruckResponseDto> {
        return this.trucksService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a truck' })
    @ApiResponse({ status: 200, type: TruckResponseDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTruckDto): Promise<TruckResponseDto> {
        return this.trucksService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a truck' })
    @ApiResponse({ status: 204 })
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.trucksService.delete(id);
    }

    
}

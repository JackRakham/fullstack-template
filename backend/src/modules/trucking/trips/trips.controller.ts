import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripDto, TripResponseDto } from '../dtos/trip.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@ApiTags('Trips')
@ApiExtraModels(PaginationDto)
@Controller('trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new trip' })
    @ApiResponse({ status: 201, type: TripResponseDto })
    create(@Body() dto: CreateTripDto): Promise<TripResponseDto> {
        return this.tripsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all trips paginated' })
    @ApiResponse({ status: 200, description: 'Return all trips paginated.' })
    findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<TripResponseDto>> {
        return this.tripsService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a trip by ID' })
    @ApiResponse({ status: 200, type: TripResponseDto })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<TripResponseDto> {
        return this.tripsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a trip' })
    @ApiResponse({ status: 200, type: TripResponseDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTripDto): Promise<TripResponseDto> {
        return this.tripsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a trip' })
    @ApiResponse({ status: 204 })
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.tripsService.delete(id);
    }

    
}

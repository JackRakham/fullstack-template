import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { TruckTripsService } from './truck-trips.service';
import { AssociateTripsDto } from '../../dtos/truck-trip.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { TripResponseDto } from '../../dtos/trip.dto';

@ApiTags('Truck Trips')
@ApiExtraModels(PaginationDto)
@Controller('trucks')
export class TruckTripsController {
    constructor(private readonly service: TruckTripsService) { }

    @Post(':truckId/trips/:tripId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Add a trip to a truck' })
    addTripToTruck(
        @Param('truckId', ParseIntPipe) truckId: number,
        @Param('tripId', ParseIntPipe) tripId: number,
    ) {
        return this.service.addTripToTruck(truckId, tripId);
    }

    @Get(':truckId/trips')
    @ApiOperation({ summary: 'Get all trips for a truck' })
    @ApiResponse({ status: 200, description: 'Return paginated trips', type: [TripResponseDto] })
    findTripsByTruckId(
        @Param('truckId', ParseIntPipe) truckId: number,
        @Query() pagination: PaginationDto,
    ): Promise<PaginatedResponseDto<TripResponseDto>> {
        return this.service.findTripsByTruckId(truckId, pagination);
    }

    @Post(':truckId/trips')
    @HttpCode(204)
    @ApiOperation({ summary: 'Replace all trips for a truck' })
    associateTripsToTruck(
        @Param('truckId', ParseIntPipe) truckId: number,
        @Body() dto: AssociateTripsDto,
    ) {
        return this.service.associateTripsToTruck(truckId, dto.trip_ids);
    }

    @Delete(':truckId/trips/:tripId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove a trip from a truck' })
    removeTripFromTruck(
        @Param('truckId', ParseIntPipe) truckId: number,
        @Param('tripId', ParseIntPipe) tripId: number,
    ) {
        return this.service.removeTripFromTruck(truckId, tripId);
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TripEntity } from '../../trips/trip.entity';
import { TruckEntity } from '../../trucks/truck.entity';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginatedResponseDto, PaginationDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { TripResponseDto } from '../../dtos/trip.dto';

@Injectable()
export class TruckTripsService {
    private readonly logger = new Logger(TruckTripsService.name);

    constructor(
        @InjectRepository(TripEntity)
        private readonly tripRepository: Repository<TripEntity>,

        @InjectRepository(TruckEntity)
        private readonly truckRepository: Repository<TruckEntity>,

        private readonly cacheService: CacheService,
    ) { }

    async findTripsByTruckId(truckId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<TripResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `truck:${truckId}:trips:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<PaginatedResponseDto<TripResponseDto>>(cacheKey);
        if (cached) return cached;

        const truck = await this.truckRepository.findOne({
            where: { id: truckId } as any,
            relations: ['trips'], // Assuming the relation property is plural
        });

        if (!truck) {
            throw new BusinessLogicException('Truck not found', BusinessError.NOT_FOUND);
        }

        const allTrips = truck.trips || [];
        const total = allTrips.length;
        const items = allTrips.slice((page - 1) * page_size, page * page_size);

        const transformedItems = plainToInstance(TripResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: transformedItems, total };
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);

        return result;
    }

    async addTripToTruck(truckId: number, tripId: number): Promise<void> {
        const truck = await this.truckRepository.findOne({
            where: { id: truckId } as any,
            relations: ['trips'],
        });
        if (!truck) {
            throw new BusinessLogicException(`TruckEntity with ID ${truckId} not found`, BusinessError.NOT_FOUND);
        }

        const trip = await this.tripRepository.findOne({ where: { id: tripId } as any });
        if (!trip) {
            throw new BusinessLogicException(`TripEntity with ID ${tripId} not found`, BusinessError.NOT_FOUND);
        }

        const alreadyHas = truck.trips.some(t => t.id === tripId);
        if (alreadyHas) return;

        truck.trips.push(trip);
        await this.truckRepository.save(truck);

        this.logger.log(`✅ TripEntity ${tripId} added to TruckEntity ${truckId}`);
        await this.invalidateCache(truckId);
    }

    async associateTripsToTruck(truckId: number, tripIds: number[]): Promise<void> {
        const truck = await this.truckRepository.findOne({
            where: { id: truckId } as any,
        });
        if (!truck) {
            throw new BusinessLogicException(`TruckEntity with ID ${truckId} not found`, BusinessError.NOT_FOUND);
        }

        const trips = await this.tripRepository.findBy({ id: In(tripIds) } as any);
        if (trips.length !== tripIds.length) {
            throw new BusinessLogicException(`Some trips were not found`, BusinessError.NOT_FOUND);
        }

        truck.trips = trips;
        await this.truckRepository.save(truck);

        this.logger.log(`✅ Associated ${tripIds.length} trips to TruckEntity ${truckId}`);
        await this.invalidateCache(truckId);
    }

    async removeTripFromTruck(truckId: number, tripId: number): Promise<void> {
        const truck = await this.truckRepository.findOne({
            where: { id: truckId } as any,
            relations: ['trips'],
        });
        if (!truck) {
            throw new BusinessLogicException(`TruckEntity with ID ${truckId} not found`, BusinessError.NOT_FOUND);
        }

        truck.trips = truck.trips.filter(t => t.id !== tripId);
        await this.truckRepository.save(truck);

        this.logger.log(`✅ TripEntity ${tripId} removed from TruckEntity ${truckId}`);
        await this.invalidateCache(truckId);
    }

    private async invalidateCache(truckId: number) {
        await this.cacheService.delPattern(`truck:${truckId}:trips:*`);
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripEntity } from './trip.entity';
import { CreateTripDto, UpdateTripDto, TripResponseDto } from '../dtos/trip.dto';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TripsService {
    private readonly logger = new Logger(TripsService.name);
    private readonly CACHE_KEY_PREFIX = 'trips:';

    constructor(
        @InjectRepository(TripEntity)
        private readonly tripRepository: Repository<TripEntity>,
        private readonly cacheService: CacheService,
    ) {}

    async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<TripResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `${this.CACHE_KEY_PREFIX}all:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<PaginatedResponseDto<TripResponseDto>>(cacheKey);
        if (cached) return cached;

        const [items, total] = await this.tripRepository.findAndCount({
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any
        });

        const dtos = plainToInstance(TripResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: dtos, total };

        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async findOne(id: number): Promise<TripResponseDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
        const cached = await this.cacheService.get<TripResponseDto>(cacheKey);
        if (cached) return cached;

        const item = await this.tripRepository.findOne({ where: { id } as any });
        if (!item) {
            throw new BusinessLogicException(`Trip with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        const result = plainToInstance(TripResponseDto, item, { excludeExtraneousValues: true });
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async create(dto: CreateTripDto): Promise<TripResponseDto> {
        const item = this.tripRepository.create(dto);
        const saved = await this.tripRepository.save(item);
        
        await this.invalidateCache();
        
        this.logger.log(`✅ Trip created: ${saved.id}`);
        return plainToInstance(TripResponseDto, saved, { excludeExtraneousValues: true });
    }

    async update(id: number, dto: UpdateTripDto): Promise<TripResponseDto> {
        const item = await this.tripRepository.findOne({ where: { id } as any });
        if (!item) {
            throw new BusinessLogicException(`Trip with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        Object.assign(item, dto);
        const updated = await this.tripRepository.save(item);
        
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Trip updated: ID ${id}`);
        return plainToInstance(TripResponseDto, updated, { excludeExtraneousValues: true });
    }

    async delete(id: number): Promise<void> {
        const item = await this.tripRepository.findOne({ where: { id } as any });
        if (!item) {
            throw new BusinessLogicException(`Trip with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.tripRepository.remove(item);
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Trip deleted: ID ${id}`);
    }

    private async invalidateCache(id?: number) {
        await this.cacheService.delPattern(`${this.CACHE_KEY_PREFIX}*`);
    }

    
}

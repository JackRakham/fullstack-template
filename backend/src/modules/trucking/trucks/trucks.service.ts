import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TruckEntity } from './truck.entity';
import { CreateTruckDto, UpdateTruckDto, TruckResponseDto } from '../dtos/truck.dto';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TrucksService {
    private readonly logger = new Logger(TrucksService.name);
    private readonly CACHE_KEY_PREFIX = 'trucks:';

    constructor(
        @InjectRepository(TruckEntity)
        private readonly truckRepository: Repository<TruckEntity>,
        private readonly cacheService: CacheService,
    ) {}

    async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<TruckResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `${this.CACHE_KEY_PREFIX}all:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<PaginatedResponseDto<TruckResponseDto>>(cacheKey);
        if (cached) return cached;

        const [items, total] = await this.truckRepository.findAndCount({
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any
        });

        const dtos = plainToInstance(TruckResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: dtos, total };

        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async findOne(id: number): Promise<TruckResponseDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
        const cached = await this.cacheService.get<TruckResponseDto>(cacheKey);
        if (cached) return cached;

        const item = await this.truckRepository.findOne({ where: { id } as any });
        if (!item) {
            throw new BusinessLogicException(`Truck with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        const result = plainToInstance(TruckResponseDto, item, { excludeExtraneousValues: true });
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async create(dto: CreateTruckDto): Promise<TruckResponseDto> {
        const item = this.truckRepository.create(dto);
        const saved = await this.truckRepository.save(item);
        
        await this.invalidateCache();
        
        this.logger.log(`✅ Truck created: ${saved.id}`);
        return plainToInstance(TruckResponseDto, saved, { excludeExtraneousValues: true });
    }

    async update(id: number, dto: UpdateTruckDto): Promise<TruckResponseDto> {
        const item = await this.truckRepository.findOne({ where: { id } as any });
        if (!item) {
            throw new BusinessLogicException(`Truck with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        Object.assign(item, dto);
        const updated = await this.truckRepository.save(item);
        
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Truck updated: ID ${id}`);
        return plainToInstance(TruckResponseDto, updated, { excludeExtraneousValues: true });
    }

    async delete(id: number): Promise<void> {
        const item = await this.truckRepository.findOne({ where: { id } as any });
        if (!item) {
            throw new BusinessLogicException(`Truck with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.truckRepository.remove(item);
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Truck deleted: ID ${id}`);
    }

    private async invalidateCache(id?: number) {
        await this.cacheService.delPattern(`${this.CACHE_KEY_PREFIX}*`);
    }

    
}

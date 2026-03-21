import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto } from '../dtos/permission.dto';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PermissionsService {
    private readonly logger = new Logger(PermissionsService.name);
    private readonly CACHE_KEY_PREFIX = 'permissions:';

    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        private readonly cacheService: CacheService,
    ) {}

    async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<PermissionResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `${this.CACHE_KEY_PREFIX}all:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<PaginatedResponseDto<PermissionResponseDto>>(cacheKey);
        if (cached) return cached;

        const [foundPermissions, total] = await this.permissionRepository.findAndCount({
            skip: (page - 1) * page_size,
            take: page_size,
            order: { name: 'ASC' } as any,
        });

        const items = plainToInstance(PermissionResponseDto, foundPermissions, { excludeExtraneousValues: true });
        const result = { items, total };

        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async findOne(id: number): Promise<PermissionResponseDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
        const cached = await this.cacheService.get<PermissionResponseDto>(cacheKey);
        if (cached) return cached;

        const permission = await this.permissionRepository.findOne({ where: { id } as any });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        const result = plainToInstance(PermissionResponseDto, permission, { excludeExtraneousValues: true });
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async create(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
        const permission = this.permissionRepository.create(dto);
        const saved = await this.permissionRepository.save(permission);
        
        await this.invalidateCache();
        
        this.logger.log(`✅ Permission created: ${saved.name}`);
        return plainToInstance(PermissionResponseDto, saved, { excludeExtraneousValues: true });
    }

    async update(id: number, dto: UpdatePermissionDto): Promise<PermissionResponseDto> {
        const permission = await this.permissionRepository.findOne({ where: { id } as any });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        Object.assign(permission, dto);
        const updated = await this.permissionRepository.save(permission);
        
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Permission updated: ${updated.name}`);
        return plainToInstance(PermissionResponseDto, updated, { excludeExtraneousValues: true });
    }

    async delete(id: number): Promise<void> {
        const permission = await this.permissionRepository.findOne({ where: { id } as any });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.permissionRepository.remove(permission);
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Permission deleted: ID ${id}`);
    }

    private async invalidateCache(id?: number) {
        await this.cacheService.delPattern(`${this.CACHE_KEY_PREFIX}*`);
    }
}

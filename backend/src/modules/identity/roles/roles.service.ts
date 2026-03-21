import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './role.entity';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from '../dtos/role.dto';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);
    private readonly CACHE_KEY_PREFIX = 'roles:';

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        private readonly cacheService: CacheService,
    ) {}

    async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `${this.CACHE_KEY_PREFIX}all:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<PaginatedResponseDto<RoleResponseDto>>(cacheKey);
        if (cached) return cached;

        const [roles, total] = await this.roleRepository.findAndCount({
            skip: (page - 1) * page_size,
            take: page_size,
            order: { name: 'ASC' } as any,
        });

        const items = plainToInstance(RoleResponseDto, roles, { excludeExtraneousValues: true });
        const result = { items, total };

        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async findOne(id: number): Promise<RoleResponseDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
        const cached = await this.cacheService.get<RoleResponseDto>(cacheKey);
        if (cached) return cached;

        const role = await this.roleRepository.findOne({ where: { id } as any });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        const result = plainToInstance(RoleResponseDto, role, { excludeExtraneousValues: true });
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);
        return result;
    }

    async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
        const role = this.roleRepository.create(dto);
        const saved = await this.roleRepository.save(role);
        
        await this.invalidateCache();
        
        this.logger.log(`✅ Role created: ${saved.name}`);
        return plainToInstance(RoleResponseDto, saved, { excludeExtraneousValues: true });
    }

    async update(id: number, dto: UpdateRoleDto): Promise<RoleResponseDto> {
        const role = await this.roleRepository.findOne({ where: { id } as any });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        Object.assign(role, dto);
        const updated = await this.roleRepository.save(role);
        
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Role updated: ${updated.name}`);
        return plainToInstance(RoleResponseDto, updated, { excludeExtraneousValues: true });
    }

    async delete(id: number): Promise<void> {
        const role = await this.roleRepository.findOne({ where: { id } as any });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.roleRepository.remove(role);
        await this.invalidateCache(id);
        
        this.logger.log(`✅ Role deleted: ID ${id}`);
    }

    private async invalidateCache(id?: number) {
        await this.cacheService.delPattern(`${this.CACHE_KEY_PREFIX}*`);
    }
}

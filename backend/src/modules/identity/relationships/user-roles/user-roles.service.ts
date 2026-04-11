import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from '../../roles/role.entity';
import { UserEntity } from '../../users/user.entity';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginatedResponseDto, PaginationDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from '../../dtos/role.dto';

@Injectable()
export class UserRolesService {
    private readonly logger = new Logger(UserRolesService.name);

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly cacheService: CacheService,
    ) { }

    async findRolesByUserId(userId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `user:${userId}:roles:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const user = await this.userRepository.findOne({
            where: { id: userId } as any,
            relations: ['roles'],
        });

        if (!user) {
            throw new BusinessLogicException(`UserEntity with ID ${userId} not found`, BusinessError.NOT_FOUND);
        }

        const allRoles = user.roles || [];
        const total = allRoles.length;
        const items = allRoles.slice((page - 1) * page_size, page * page_size);

        const transformedItems = plainToInstance(RoleResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: transformedItems, total };
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);

        return result;
    }

    async addRoleToUser(userId: number, roleId: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId } as any,
            relations: ['roles'],
        });
        if (!user) {
            throw new BusinessLogicException(`UserEntity with ID ${userId} not found`, BusinessError.NOT_FOUND);
        }

        const role = await this.roleRepository.findOne({ where: { id: roleId } as any });
        if (!role) {
            throw new BusinessLogicException(`RoleEntity with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const alreadyHas = user.roles.some(t => t.id === roleId);
        if (alreadyHas) return;

        user.roles.push(role);
        await this.userRepository.save(user);

        this.logger.log(`✅ RoleEntity ${roleId} added to UserEntity ${userId}`);
        await this.invalidateCache(userId);
    }

    async associateRolesToUser(userId: number, roleIds: number[]): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId } as any,
        });
        if (!user) {
            throw new BusinessLogicException(`UserEntity with ID ${userId} not found`, BusinessError.NOT_FOUND);
        }

        const roles = await this.roleRepository.findBy({ id: In(roleIds) } as any);
        if (roles.length !== roleIds.length) {
            throw new BusinessLogicException(`Some roles were not found`, BusinessError.NOT_FOUND);
        }

        user.roles = roles;
        await this.userRepository.save(user);

        this.logger.log(`✅ Associated ${roleIds.length} roles to UserEntity ${userId}`);
        await this.invalidateCache(userId);
    }

    async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId } as any,
            relations: ['roles'],
        });
        if (!user) {
            throw new BusinessLogicException(`UserEntity with ID ${userId} not found`, BusinessError.NOT_FOUND);
        }

        user.roles = user.roles.filter(t => t.id !== roleId);
        await this.userRepository.save(user);

        this.logger.log(`✅ RoleEntity ${roleId} removed from UserEntity ${userId}`);
        await this.invalidateCache(userId);
    }

    private async invalidateCache(userId: number) {
        await this.cacheService.delPattern(`user:${userId}:roles:*`);
    }
}

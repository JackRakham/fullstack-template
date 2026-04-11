import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserEntity } from '../../users/user.entity';
import { RoleEntity } from '../../roles/role.entity';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginatedResponseDto, PaginationDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../dtos/user.dto';

@Injectable()
export class RoleUsersService {
    private readonly logger = new Logger(RoleUsersService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        private readonly cacheService: CacheService,
    ) { }

    async findUsersByRoleId(roleId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `role:${roleId}:users:page:${page}:size:${page_size}`;

        const cached = await this.cacheService.get<any>(cacheKey);
        if (cached) return cached;

        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
            relations: ['users'],
        });

        if (!role) {
            throw new BusinessLogicException(`RoleEntity with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const allUsers = role.users || [];
        const total = allUsers.length;
        const items = allUsers.slice((page - 1) * page_size, page * page_size);

        const transformedItems = plainToInstance(UserResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: transformedItems, total };
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);

        return result;
    }

    async addUserToRole(roleId: number, userId: number): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
            relations: ['users'],
        });
        if (!role) {
            throw new BusinessLogicException(`RoleEntity with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const user = await this.userRepository.findOne({ where: { id: userId } as any });
        if (!user) {
            throw new BusinessLogicException(`UserEntity with ID ${userId} not found`, BusinessError.NOT_FOUND);
        }

        const alreadyHas = role.users.some(t => t.id === userId);
        if (alreadyHas) return;

        role.users.push(user);
        await this.roleRepository.save(role);

        this.logger.log(`✅ UserEntity ${userId} added to RoleEntity ${roleId}`);
        await this.invalidateCache(roleId);
    }

    async associateUsersToRole(roleId: number, userIds: number[]): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
        });
        if (!role) {
            throw new BusinessLogicException(`RoleEntity with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const users = await this.userRepository.findBy({ id: In(userIds) } as any);
        if (users.length !== userIds.length) {
            throw new BusinessLogicException(`Some users were not found`, BusinessError.NOT_FOUND);
        }

        role.users = users;
        await this.roleRepository.save(role);

        this.logger.log(`✅ Associated ${userIds.length} users to RoleEntity ${roleId}`);
        await this.invalidateCache(roleId);
    }

    async removeUserFromRole(roleId: number, userId: number): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
            relations: ['users'],
        });
        if (!role) {
            throw new BusinessLogicException(`RoleEntity with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        role.users = role.users.filter(t => t.id !== userId);
        await this.roleRepository.save(role);

        this.logger.log(`✅ UserEntity ${userId} removed from RoleEntity ${roleId}`);
        await this.invalidateCache(roleId);
    }

    private async invalidateCache(roleId: number) {
        await this.cacheService.delPattern(`role:${roleId}:users:*`);
    }
}

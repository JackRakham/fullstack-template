import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from '../../roles/role.entity';
import { PermissionEntity } from '../../permissions/permission.entity';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginatedResponseDto, PaginationDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { PermissionResponseDto } from '../../dtos/permission.dto';

@Injectable()
export class RolePermissionsService {
    private readonly logger = new Logger(RolePermissionsService.name);

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,

        private readonly cacheService: CacheService,
    ) { }

    /**
     * Find permissions associated with a role (paginated)
     */
    async findPermissionsByRoleId(roleId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<PermissionResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `role:${roleId}:permissions:page:${page}:size:${page_size}`;

        // First, try to get the paginated result directly from cache
        const cachedPaginatedResult = await this.cacheService.get<PaginatedResponseDto<PermissionResponseDto>>(cacheKey);
        if (cachedPaginatedResult) {
            return cachedPaginatedResult;
        }

        // If paginated result not in cache, get all permissions for the role (potentially from cache)
        const allPermissionsCacheKey = `role:${roleId}:permissions:all`;
        let allPermissions: PermissionResponseDto[];

        const cachedAllPermissions = await this.cacheService.get<PermissionResponseDto[]>(allPermissionsCacheKey);
        if (cachedAllPermissions) {
            allPermissions = cachedAllPermissions;
        } else {
            const role = await this.roleRepository.findOne({
                where: { id: roleId } as any,
                relations: ['permissions'],
            });

            if (!role) {
                throw new BusinessLogicException('Role not found', BusinessError.NOT_FOUND);
            }

            allPermissions = role.permissions.map((p) => plainToInstance(PermissionResponseDto, p, { excludeExtraneousValues: true }));
            await this.cacheService.set(allPermissionsCacheKey, allPermissions, CacheTTL.TEN_MINUTES);
        }

        const total = allPermissions.length;
        const items = allPermissions.slice((page - 1) * page_size, page * page_size);

        const transformedItems = plainToInstance(PermissionResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: transformedItems, total };
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);

        return result;
    }

    /**
     * Add a single permission to a role
     */
    async addPermissionToRole(roleId: number, permissionId: number): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
            relations: ['permissions'],
        });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const permission = await this.permissionRepository.findOne({ where: { id: permissionId } as any });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${permissionId} not found`, BusinessError.NOT_FOUND);
        }

        const alreadyHas = role.permissions.some(p => p.id === permissionId);
        if (alreadyHas) return;

        role.permissions.push(permission);
        await this.roleRepository.save(role);

        this.logger.log(`✅ Permission ${permissionId} added to role ${roleId}`);
        await this.invalidateRoleCache(roleId);
    }

    /**
     * Replace all permissions for a role
     */
    async associatePermissionsToRole(roleId: number, permissionIds: number[]): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
        });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const permissions = await this.permissionRepository.findBy({ id: In(permissionIds) } as any);
        if (permissions.length !== permissionIds.length) {
            throw new BusinessLogicException(`Some permissions were not found`, BusinessError.NOT_FOUND);
        }

        role.permissions = permissions;
        await this.roleRepository.save(role);

        this.logger.log(`✅ Associated ${permissionIds.length} permissions to role ${roleId}`);
        await this.invalidateRoleCache(roleId);
    }

    /**
     * Remove a permission from a role
     */
    async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: roleId } as any,
            relations: ['permissions'],
        });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        role.permissions = role.permissions.filter(p => p.id !== permissionId);
        await this.roleRepository.save(role);

        this.logger.log(`✅ Permission ${permissionId} removed from role ${roleId}`);
        await this.invalidateRoleCache(roleId);
    }

    private async invalidateRoleCache(roleId: number) {
        // Invalidate all paginated pages for this role
        await this.cacheService.delPattern(`role:${roleId}:permissions:*`);
    }
}

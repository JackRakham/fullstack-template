import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from '../../roles/role.entity';
import { PermissionEntity } from '../../permissions/permission.entity';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { PaginatedResponseDto, PaginationDto } from 'src/shared/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from '../../dtos/role.dto';

@Injectable()
export class PermissionRolesService {
    private readonly logger = new Logger(PermissionRolesService.name);

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,

        private readonly cacheService: CacheService,
    ) { }

    /**
     * Find roles associated with a permission (paginated)
     */
    async findRolesByPermissionId(permissionId: number, pagination: PaginationDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;
        const cacheKey = `permission:${permissionId}:roles:page:${page}:size:${page_size}`;

        const cachedAllRoles = await this.cacheService.get<RoleResponseDto[]>(`permission:${permissionId}:roles:all`);
        let allRoles: RoleResponseDto[];

        if (cachedAllRoles) {
            allRoles = cachedAllRoles;
        } else {
            const permission = await this.permissionRepository.findOne({
                where: { id: permissionId } as any,
                relations: ['roles'],
            });

            if (!permission) {
                throw new BusinessLogicException('Permission not found', BusinessError.NOT_FOUND);
            }

            allRoles = permission.roles.map((r) => plainToInstance(RoleResponseDto, r));
            await this.cacheService.set(`permission:${permissionId}:roles:all`, allRoles, CacheTTL.TEN_MINUTES);
        }

        const total = allRoles.length;
        const items = allRoles.slice((page - 1) * page_size, page * page_size);

        const transformedItems = plainToInstance(RoleResponseDto, items, { excludeExtraneousValues: true });
        const result = { items: transformedItems, total };
        await this.cacheService.set(cacheKey, result, CacheTTL.TEN_MINUTES);

        return result;
    }

    /**
     * Add a single role to a permission
     */
    async addRoleToPermission(permissionId: number, roleId: number): Promise<void> {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId } as any,
            relations: ['roles'],
        });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${permissionId} not found`, BusinessError.NOT_FOUND);
        }

        const role = await this.roleRepository.findOne({ where: { id: roleId } as any });
        if (!role) {
            throw new BusinessLogicException(`Role with ID ${roleId} not found`, BusinessError.NOT_FOUND);
        }

        const alreadyHas = permission.roles.some(r => r.id === roleId);
        if (alreadyHas) return;

        permission.roles.push(role);
        await this.permissionRepository.save(permission);

        this.logger.log(`✅ Role ${roleId} added to permission ${permissionId}`);
        await this.invalidatePermissionCache(permissionId);
    }

    /**
     * Replace all roles for a permission
     */
    async associateRolesToPermission(permissionId: number, roleIds: number[]): Promise<void> {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId } as any,
        });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${permissionId} not found`, BusinessError.NOT_FOUND);
        }

        const roles = await this.roleRepository.findBy({ id: In(roleIds) } as any);
        if (roles.length !== roleIds.length) {
            throw new BusinessLogicException(`Some roles were not found`, BusinessError.NOT_FOUND);
        }

        permission.roles = roles;
        await this.permissionRepository.save(permission);

        this.logger.log(`✅ Associated ${roleIds.length} roles to permission ${permissionId}`);
        await this.invalidatePermissionCache(permissionId);
    }

    /**
     * Remove a role from a permission
     */
    async removeRoleFromPermission(permissionId: number, roleId: number): Promise<void> {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId } as any,
            relations: ['roles'],
        });
        if (!permission) {
            throw new BusinessLogicException(`Permission with ID ${permissionId} not found`, BusinessError.NOT_FOUND);
        }

        permission.roles = permission.roles.filter(r => r.id !== roleId);
        await this.permissionRepository.save(permission);

        this.logger.log(`✅ Role ${roleId} removed from permission ${permissionId}`);
        await this.invalidatePermissionCache(permissionId);
    }

    private async invalidatePermissionCache(permissionId: number) {
        await this.cacheService.delPattern(`permission:${permissionId}:roles:*`);
    }
}

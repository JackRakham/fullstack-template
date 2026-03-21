import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationEntity } from './user-notification.entity';
import { 
    CreateUserNotificationDto, 
    UpdateUserNotificationDto, 
    UserNotificationPaginationDto, 
    UserNotificationResponseDto 
} from '../dtos/user-notification.dto';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { plainToInstance } from 'class-transformer';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { UserEntity } from 'src/modules/identity/users/user.entity';
import { NotificationEntity } from '../notifications/notification.entity';
import { PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@Injectable()
export class UserNotificationsService {
    private readonly logger = new Logger(UserNotificationsService.name);

    constructor(
        @InjectRepository(UserNotificationEntity)
        private readonly userNotificationRepository: Repository<UserNotificationEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
        private readonly cacheService: CacheService,
    ) { }

    /**
     * Find all user notifications with pagination
     */
    async findAll(pagination: UserNotificationPaginationDto): Promise<PaginatedResponseDto<UserNotificationResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;

        const [notifications, total] = await this.userNotificationRepository.findAndCount({
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any,
        });

        const items = notifications.map((n) => plainToInstance(UserNotificationResponseDto, n));

        return { items, total };
    }

    /**
     * Find one user notification by ID
     */
    async findOne(id: number): Promise<UserNotificationResponseDto> {
        const cacheKey = `user-notification:${id}`;

        const cached = await this.cacheService.get<UserNotificationEntity>(cacheKey);
        if (cached) {
            return plainToInstance(UserNotificationResponseDto, cached);
        }

        const notification = await this.userNotificationRepository.findOne({ 
            where: { id } as any,
            relations: ['user', 'notification']
        });
        
        if (!notification) {
            throw new BusinessLogicException(`User notification with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.cacheService.set(cacheKey, notification, CacheTTL.TEN_MINUTES);

        return plainToInstance(UserNotificationResponseDto, notification);
    }

    /**
     * Search notifications by User
     */
    async findByUser(user_id: number, pagination: UserNotificationPaginationDto): Promise<PaginatedResponseDto<UserNotificationResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;

        const [notifications, total] = await this.userNotificationRepository.findAndCount({
            where: { user: { id: user_id } } as any,
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any,
        });

        const items = notifications.map((n) => plainToInstance(UserNotificationResponseDto, n));

        return { items, total };
    }

    /**
     * Search notifications by Notification template/type
     */
    async findByNotification(notification_id: number, pagination: UserNotificationPaginationDto): Promise<PaginatedResponseDto<UserNotificationResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;

        const [notifications, total] = await this.userNotificationRepository.findAndCount({
            where: { notification: { id: notification_id } } as any,
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any,
        });

        const items = notifications.map((n) => plainToInstance(UserNotificationResponseDto, n));

        return { items, total };
    }

    /**
     * Create user notification
     */
    async create(dto: CreateUserNotificationDto): Promise<UserNotificationResponseDto> {
        const user = await this.userRepository.findOne({ where: { id: dto.user_id } as any });
        if (!user) {
            throw new BusinessLogicException(`User with ID ${dto.user_id} not found`, BusinessError.NOT_FOUND);
        }

        const notificationTemplate = await this.notificationRepository.findOne({ where: { id: dto.notification_id } as any });
        if (!notificationTemplate) {
            throw new BusinessLogicException(`Notification template with ID ${dto.notification_id} not found`, BusinessError.NOT_FOUND);
        }

        const userNotification = this.userNotificationRepository.create({
            readed: dto.readed,
            user,
            notification: notificationTemplate
        });

        const saved = await this.userNotificationRepository.save(userNotification);
        return this.findOne(saved.id);
    }

    /**
     * Update user notification
     */
    async update(id: number, dto: UpdateUserNotificationDto): Promise<UserNotificationResponseDto> {
        const notification = await this.userNotificationRepository.findOne({ where: { id } as any });
        if (!notification) {
            throw new BusinessLogicException(`User notification with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        Object.assign(notification, dto);
        const updated = await this.userNotificationRepository.save(notification);

        await this.cacheService.del(`user-notification:${id}`);

        return this.findOne(updated.id);
    }

    /**
     * Delete user notification
     */
    async delete(id: number): Promise<void> {
        const notification = await this.userNotificationRepository.findOne({ where: { id } as any });
        if (!notification) {
            throw new BusinessLogicException(`User notification with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.userNotificationRepository.remove(notification);
        await this.cacheService.del(`user-notification:${id}`);
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { 
    CreateNotificationDto, 
    UpdateNotificationDto, 
    NotificationPaginationDto, 
    NotificationResponseDto 
} from '../dtos/notification.dto';
import { CacheService, CacheTTL } from 'src/shared/services/cache.service';
import { plainToInstance } from 'class-transformer';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';
import { PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
        private readonly cacheService: CacheService,
    ) { }

    /**
     * Find all notifications with pagination
     */
    async findAll(pagination: NotificationPaginationDto): Promise<PaginatedResponseDto<NotificationResponseDto>> {
        const { page = 1, page_size = 10 } = pagination;

        const [notifications, total] = await this.notificationRepository.findAndCount({
            skip: (page - 1) * page_size,
            take: page_size,
            order: { created_at: 'DESC' } as any,
        });

        const items = notifications.map((n) => plainToInstance(NotificationResponseDto, n));

        return { items, total };
    }

    /**
     * Find one notification by ID
     */
    async findOne(id: number): Promise<NotificationResponseDto> {
        const cacheKey = `notification:${id}`;

        const cached = await this.cacheService.get<NotificationEntity>(cacheKey);
        if (cached) {
            return plainToInstance(NotificationResponseDto, cached);
        }

        const notification = await this.notificationRepository.findOne({ where: { id } as any });
        if (!notification) {
            throw new BusinessLogicException(`Notification with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.cacheService.set(cacheKey, notification, CacheTTL.TEN_MINUTES);

        return plainToInstance(NotificationResponseDto, notification);
    }

    /**
     * Create notification
     */
    async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
        const notification = this.notificationRepository.create(dto);
        const saved = await this.notificationRepository.save(notification);
        return this.findOne(saved.id);
    }

    /**
     * Update notification
     */
    async update(id: number, dto: UpdateNotificationDto): Promise<NotificationResponseDto> {
        const notification = await this.notificationRepository.findOne({ where: { id } as any });
        if (!notification) {
            throw new BusinessLogicException(`Notification with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        Object.assign(notification, dto);
        const updated = await this.notificationRepository.save(notification);

        await this.cacheService.del(`notification:${id}`);

        return this.findOne(updated.id);
    }

    /**
     * Delete notification
     */
    async delete(id: number): Promise<void> {
        const notification = await this.notificationRepository.findOne({ where: { id } as any });
        if (!notification) {
            throw new BusinessLogicException(`Notification with ID ${id} not found`, BusinessError.NOT_FOUND);
        }

        await this.notificationRepository.remove(notification);
        await this.cacheService.del(`notification:${id}`);
    }
}

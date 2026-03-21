import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { 
    CreateNotificationDto, 
    UpdateNotificationDto, 
    NotificationResponseDto 
} from '../dtos/notification.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@ApiTags('Notifications')
@ApiExtraModels(PaginationDto)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new notification template' })
    @ApiResponse({ status: 201, type: NotificationResponseDto })
    create(@Body() dto: CreateNotificationDto) {
        return this.notificationsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notifications paginated' })
    @ApiResponse({ status: 200, description: 'Return all notifications paginated.' })
    findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<NotificationResponseDto>> {
        return this.notificationsService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a notification by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a notification' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotificationDto) {
        return this.notificationsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.delete(id);
    }
}

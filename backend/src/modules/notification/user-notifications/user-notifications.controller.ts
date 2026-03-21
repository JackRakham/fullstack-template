import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { UserNotificationsService } from './user-notifications.service';
import { 
    CreateUserNotificationDto, 
    UpdateUserNotificationDto, 
    UserNotificationResponseDto 
} from '../dtos/user-notification.dto';
import { PaginationDto, PaginatedResponseDto } from 'src/shared/dtos/pagination.dto';

@ApiTags('User Notifications')
@ApiExtraModels(PaginationDto)
@Controller('user-notifications')
export class UserNotificationsController {
    constructor(private readonly userNotificationsService: UserNotificationsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user notification' })
    @ApiResponse({ status: 201, type: UserNotificationResponseDto })
    create(@Body() dto: CreateUserNotificationDto) {
        return this.userNotificationsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user notifications paginated' })
    @ApiResponse({ status: 200, description: 'Return all user notifications paginated.' })
    findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponseDto<UserNotificationResponseDto>> {
        return this.userNotificationsService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user notification by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userNotificationsService.findOne(id);
    }

    @Get('user/:user_id')
    @ApiOperation({ summary: 'Search notifications by user ID' })
    @ApiResponse({ status: 200, description: 'Return user notifications paginated.' })
    findByUser(@Param('user_id', ParseIntPipe) user_id: number, @Query() pagination: PaginationDto): Promise<PaginatedResponseDto<UserNotificationResponseDto>> {
        return this.userNotificationsService.findByUser(user_id, pagination);
    }

    @Get('notification/:notification_id')
    @ApiOperation({ summary: 'Search by notification template/type ID' })
    @ApiResponse({ status: 200, description: 'Return notifications paginated.' })
    findByNotification(@Param('notification_id', ParseIntPipe) notification_id: number, @Query() pagination: PaginationDto): Promise<PaginatedResponseDto<UserNotificationResponseDto>> {
        return this.userNotificationsService.findByNotification(notification_id, pagination);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a user notification status' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserNotificationDto) {
        return this.userNotificationsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user notification' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userNotificationsService.delete(id);
    }
}

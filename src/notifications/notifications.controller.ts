import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '@common/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with pagination' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @Request() req,
    @Query() query: GetNotificationsDto,
  ) {
    const userId = req.user.id;
    const notifications = await this.notificationsService.getNotificationsByUserId(
      userId,
      query.page,
      query.limit,
    );
    return new DefaultResponseDto(
      'Notifications retrieved successfully',
      true,
      notifications,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return new DefaultResponseDto(
      'Unread count retrieved successfully',
      true,
      { unreadCount: count },
    );
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.id;
    const notification = await this.notificationsService.markAsRead(id, userId);
    return new DefaultResponseDto(
      'Notification marked as read',
      true,
      notification,
    );
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
    return new DefaultResponseDto(
      'All notifications marked as read',
      true,
      null,
    );
  }

  @Put('fcm-token')
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  async updateFcmToken(
    @Request() req,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    const userId = req.user.id;
    const user = await this.notificationsService.updateFcmToken(
      userId,
      updateFcmTokenDto.fcmToken,
    );
    return new DefaultResponseDto(
      'FCM token updated successfully',
      true,
      user,
    );
  }

  @Delete('fcm-token')
  @ApiOperation({ summary: 'Remove FCM token' })
  @ApiResponse({ status: 200, description: 'FCM token removed successfully' })
  async removeFcmToken(@Request() req) {
    const userId = req.user.id;
    const user = await this.notificationsService.removeFcmToken(userId);
    return new DefaultResponseDto(
      'FCM token removed successfully',
      true,
      user,
    );
  }
} 
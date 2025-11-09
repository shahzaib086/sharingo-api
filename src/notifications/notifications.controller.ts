import {
  Controller,
  Get,
  Put,
  Post,
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
import { UpdateFcmTokenPublicDto } from './dto/update-fcm-token-public.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '@common/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token/update')
  @ApiOperation({ 
    summary: 'Update FCM token (Public - No authentication required)',
    description: 'Updates or creates an FCM token for a device. If deviceId already exists, updates the fcmToken and userId. Supports guest users when userId is not provided.'
  })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  async updateFcmTokenPublic(
    @Body() updateFcmTokenPublicDto: UpdateFcmTokenPublicDto,
  ) {
    const userToken = await this.notificationsService.updateFcmToken(
      updateFcmTokenPublicDto.userId || null,
      updateFcmTokenPublicDto.deviceId,
      updateFcmTokenPublicDto.fcmToken,
    );
    return new DefaultResponseDto(
      'FCM token updated successfully',
      true,
      userToken,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update FCM token for push notifications (Authenticated)' })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  async updateFcmToken(
    @Request() req,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    const userId = req.user?.id || null;
    const userToken = await this.notificationsService.updateFcmToken(
      userId,
      updateFcmTokenDto.deviceId,
      updateFcmTokenDto.fcmToken,
    );
    return new DefaultResponseDto(
      'FCM token updated successfully',
      true,
      userToken,
    );
  }

  @Delete('fcm-token/:deviceId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove FCM token by device ID' })
  @ApiResponse({ status: 200, description: 'FCM token removed successfully' })
  async removeFcmToken(@Param('deviceId') deviceId: string) {
    await this.notificationsService.removeFcmToken(deviceId);
    return new DefaultResponseDto(
      'FCM token removed successfully',
      true,
      null,
    );
  }

  @Get('user-tokens')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all FCM tokens for the current user' })
  @ApiResponse({ status: 200, description: 'User tokens retrieved successfully' })
  async getUserTokens(@Request() req) {
    const userId = req.user.id;
    const tokens = await this.notificationsService.getUserTokensByUserId(userId);
    return new DefaultResponseDto(
      'User tokens retrieved successfully',
      true,
      tokens,
    );
  }
} 
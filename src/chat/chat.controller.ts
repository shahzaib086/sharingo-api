import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { InitiateChatDto } from './dto/initiate-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetChatHeadsDto } from './dto/get-chat-heads.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DefaultResponseDto } from '../common/dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('initiate')
  @ApiOperation({
    summary: 'Initiate a chat with a user for a product',
    description:
      'Creates a new chat or returns existing chat between two users for a specific product. UserA is always the product owner.',
  })
  async initiateChat(
    @Body() initiateChatDto: InitiateChatDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const chat = await this.chatService.initiateChat(initiateChatDto, userId);
    return new DefaultResponseDto('Chat initiated successfully', true, chat);
  }

  @Get('heads')
  @ApiOperation({
    summary: 'Get all chat heads for the current user',
    description:
      'Returns a paginated list of all chats (chat heads) the user is part of, ordered by last message timestamp',
  })
  async getChatHeads(
    @Query() getChatHeadsDto: GetChatHeadsDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const result = await this.chatService.getChatHeads(userId, getChatHeadsDto);
    return new DefaultResponseDto(
      'Chat heads retrieved successfully',
      true,
      result,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get total unread messages count',
    description: 'Returns the total number of unread messages for the current user',
  })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    const count = await this.chatService.getUnreadCount(userId);
    return new DefaultResponseDto(
      'Unread count retrieved successfully',
      true,
      { count },
    );
  }

  @Get(':chatId')
  @ApiOperation({
    summary: 'Get chat details by ID',
    description: 'Returns detailed information about a specific chat',
  })
  @ApiParam({ name: 'chatId', type: Number })
  async getChatById(@Param('chatId') chatId: string, @Request() req: any) {
    const id = parseInt(chatId);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid chat ID');
    }

    const userId = req.user.id;
    const chat = await this.chatService.getChatById(id, userId);
    return new DefaultResponseDto(
      'Chat retrieved successfully',
      true,
      chat,
    );
  }

  @Get(':chatId/messages')
  @ApiOperation({
    summary: 'Get all messages in a chat',
    description:
      'Returns a paginated list of messages in a specific chat, ordered chronologically',
  })
  @ApiParam({ name: 'chatId', type: Number })
  async getMessages(
    @Param('chatId') chatId: string,
    @Query() getMessagesDto: GetMessagesDto,
    @Request() req: any,
  ) {
    const id = parseInt(chatId);

    if (isNaN(id)) {
      throw new BadRequestException('Invalid chat ID');
    }

    const userId = req.user.id;
    const result = await this.chatService.getMessages(
      id,
      userId,
      getMessagesDto,
    );
    return new DefaultResponseDto(
      'Messages retrieved successfully',
      true,
      result,
    );
  }

  @Post('message')
  @ApiOperation({
    summary: 'Send a message in a chat',
    description:
      'Sends a new message in the specified chat. Only users who are part of the chat can send messages.',
  })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const message = await this.chatService.sendMessage(sendMessageDto, userId);
    return new DefaultResponseDto('Message sent successfully', true, message);
  }

  @Patch('mark-read')
  @ApiOperation({
    summary: 'Mark messages as read',
    description:
      'Marks all unread messages in a chat as read for the current user',
  })
  async markAsRead(@Body() markReadDto: MarkReadDto, @Request() req: any) {
    const userId = req.user.id;
    await this.chatService.markMessagesAsRead(markReadDto.chatId, userId);
    return new DefaultResponseDto(
      'Messages marked as read successfully',
      true,
      null,
    );
  }
}


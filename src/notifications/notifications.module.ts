import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FcmService } from './fcm.service';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { UserToken } from '../entities/user-token.entity';
import { Product } from '../entities/product.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, UserToken, Product]), JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService): JwtModuleOptions => ({
      global: true,
      secret: configService.get<string>('jwtSecret'),
      signOptions: { expiresIn: configService.get<any>('jwtExpiration') },
    }),
  })],
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmService],
  exports: [NotificationsService, FcmService],
})
export class NotificationsModule {} 
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GeneralModule } from './general/general.module';
import { ContentModule } from './content/content.module';
import { ProductsModule } from './products/products.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AddressesModule } from './addresses/addresses.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    GeneralModule,
    ContentModule,
    ProductsModule,
    NotificationsModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

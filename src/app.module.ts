import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import databaseConfig from '../config/database.config';
import tokenConfig from '../config/token.config';
import { User } from './users/models/user.model';
import { BooksModule } from './books/books.module';
import { Book } from './books/models/book.model';
import { Borrowings } from './borrowings/models/borrowing.model';
import { ReportsModule } from './reports/reports.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, tokenConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('DATABASE.DRIVER'),
        replication: {
          read: [
            {
              host: configService.get('DATABASE.HOST_READ'),
              port: configService.get('DATABASE.PORT'),
              username: configService.get('DATABASE.USER'),
              password: configService.get('DATABASE.PASS'),
            },
          ],
          write: {
            host: configService.get('DATABASE.HOST_WRITE'),
            port: configService.get('DATABASE.PORT'),
            username: configService.get('DATABASE.USER'),
            password: configService.get('DATABASE.PASS'),
          },
        },
        database: configService.get('DATABASE.NAME'),
        models: [User, Book, Borrowings],
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    BooksModule,
    ReportsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 2000,
        limit: 1,
      },
    ]),
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

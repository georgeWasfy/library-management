import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
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
        models: [],
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

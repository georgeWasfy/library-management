import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenStrategy } from './strategies/refresh-token-strategy';
import { AccessTokenStrategy } from './strategies/access-token-strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@base/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({}),ConfigModule, UsersModule],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule {}

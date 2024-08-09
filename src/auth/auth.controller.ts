import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from './decorator/public.decorator';
import {
  SignInSchema,
  SignInType,
  SignUpSchema,
  SignUpType,
  Tokens,
} from './dto/auth.schema';
import { ValidationPipe } from '@base/pipes/validation.pipe';
import { GetCurrentUser } from './decorator/current-user.decorator';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('local/signup')
  async localSignUp(
    @Body(new ValidationPipe(SignUpSchema)) signupDto: SignUpType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Partial<Tokens>> {
    const tokens = await this.authService.localSignUp(signupDto);
    response.cookie('refresh-token', tokens.refresh_token, { httpOnly: true });
    return { access_token: tokens.access_token };
  }

  @Public()
  @Post('local/signin')
  async localSignIn(
    @Body(new ValidationPipe(SignInSchema)) signinDto: SignInType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.localSignIn(signinDto);
    const { refresh_token, password, hashedRt, ...user } = tokens;
    response.cookie('refresh_token', tokens.refresh_token, { httpOnly: true });
    return { user };
  }

  @Post('/local/logout')
  localLogOut(@GetCurrentUser('sub') userId: number) {
    return this.authService.localLogOut(userId);
  }

  @Public()
  @Post('local/refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshTokens(
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Partial<Tokens>> {
    const tokens = await this.authService.refreshTokens(+userId, refreshToken);
    response.cookie('refresh-token', tokens.refresh_token, { httpOnly: true });
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    return { access_token: tokens.access_token };
  }
}

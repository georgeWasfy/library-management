import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInType, SignUpType, Tokens } from './dto/auth.schema';
import { UsersService } from '@base/users/users.service';
import { User } from '@base/users/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService,
  ) {}
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async generateTokens(userKey: number, email: string): Promise<Tokens> {
    const jwtPayload = {
      sub: userKey,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('TOKEN.ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('TOKEN.ACCESS_TOKEN_EXPIRY'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('TOKEN.REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('TOKEN.REFRESH_TOKEN_EXPIRY'),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await this.hashPassword(rt);
    await User.update(
      {
        hashedRt: hash,
      },
      {
        where: { id: userId },
      },
    );
  }

  async localSignUp(signupDto: SignUpType): Promise<Tokens> {
    var tokens = { access_token: '', refresh_token: '' };
    try {
      const hashedPassword = await this.hashPassword(signupDto.password);
      signupDto.password = hashedPassword;
      const userByEmail = await User.findOne({
        where: { email: signupDto.email },
      });
      if (userByEmail)
        throw new BadRequestException('User with this email already exist');
      const createdUser = await this.userService.create(signupDto);
      if (createdUser) {
        const tokens = await this.generateTokens(
          createdUser.data.user.id,
          createdUser.data.user.email,
        );
        await this.updateRtHash(createdUser.data.user.id, tokens.refresh_token);
      } else {
        throw new HttpException(
          'Could not create User',
          HttpStatus.BAD_REQUEST,
        );
      }
      return tokens;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async localSignIn(signinDto: SignInType) {
    var tokens = { access_token: '', refresh_token: '' };
    try {
      const userByEmail = await User.findOne({
        where: { email: signinDto.email },
      });
      if (userByEmail) {
        const matchPasswords = await bcrypt.compare(
          signinDto.password,
          userByEmail.password,
        );
        if (!matchPasswords) throw new ForbiddenException('Access Denied');

        tokens = await this.generateTokens(userByEmail.id, signinDto.email);
        await this.updateRtHash(userByEmail.id, tokens.refresh_token);
      } else {
        throw new ForbiddenException('Access Denied');
      }

      return { ...tokens, ...userByEmail };
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async localLogOut(userId: number) {
    await User.update(
      {
        hashedRt: null,
      },
      {
        where: { id: userId },
      },
    );
  }

  async refreshTokens(userId: number, refresh_token: string): Promise<Tokens> {
    const user = await User.findByPk(userId);
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');
    const matchTokens = await bcrypt.compare(refresh_token, user.hashedRt!);
    if (!matchTokens) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }
}

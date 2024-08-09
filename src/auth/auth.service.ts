import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInType, SignUpType, Tokens } from './dto/auth.schema';
import { UsersService } from '@base/users/users.service';
import { User } from '@base/users/models/user.model';
import { Sequelize } from 'sequelize-typescript';
import { Transaction, ValidationError } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService,
    private readonly sequelize: Sequelize,
  ) {}
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async generateTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload = {
      sub: userId,
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

  async updateRtHash(
    userId: number,
    rt: string,
    transaction?: Transaction,
  ): Promise<void> {
    const hash = await this.hashPassword(rt);
    await User.update(
      {
        hashedRt: hash,
      },
      {
        where: { id: userId },
        transaction: transaction ?? undefined,
      },
    );
  }

  async localSignUp(signupDto: SignUpType): Promise<Tokens> {
    const transaction = await this.sequelize.transaction();
    try {
      const hashedPassword = await this.hashPassword(signupDto.password);
      signupDto.password = hashedPassword;
      const createdUser = await User.create(signupDto, { transaction });

      const tokens = await this.generateTokens(
        createdUser.id,
        createdUser.email,
      );
      await this.updateRtHash(
        createdUser.id,
        tokens.refresh_token,
        transaction,
      );
      await transaction.commit();
      return tokens;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new BadRequestException(
            'A User with same email already exists',
          );
        }
      }
      throw new BadRequestException('Unable to create User');
    }
  }

  async localSignIn(signinDto: SignInType) {
    let tokens = { access_token: '', refresh_token: '' };
    try {
      const userByEmail = await User.findOne({
        where: { email: signinDto.email },
        attributes: {include: ['name', 'email', 'password', 'is_active', 'created_at', 'updated_at']}
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
      return { ...tokens, ...userByEmail.dataValues };
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
    const user = await User.findByPk(userId, { attributes: { include: ['hashedRt', 'id', 'email']}});
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');
    const matchTokens = await bcrypt.compare(refresh_token, user.hashedRt!);
    if (!matchTokens) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }
}

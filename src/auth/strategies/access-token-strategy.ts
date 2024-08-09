import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '../../../utils/env';

type jwtPayload = {
  sub: string;
  email: string;
}
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env('ACCESS_TOKEN_SECRET'),
    });
  }

  validate(payload: jwtPayload) {
    return payload;
  }
}
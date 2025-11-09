import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const cookieHeader: string | undefined = req?.headers?.cookie;
          if (!cookieHeader) return null;
          const token = cookieHeader
            .split(';')
            .map(v => v.trim())
            .map(v => v.split('='))
            .reduce((acc, [k, ...rest]) => ({ ...acc, [k]: decodeURIComponent(rest.join('=')) }), {} as Record<string, string>)[
              'access_token'
            ];
          return token || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Passport автоматически проверит токен и вызовет этот метод, если он валиден
  async validate(payload: any) {
    // payload - это декодированный JWT
    // Возвращаем весь payload, чтобы гварды могли получить доступ к роли
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}

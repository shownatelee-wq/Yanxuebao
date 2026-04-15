import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccountPasswordLoginDto, DeviceAuthorizationCodeLoginDto } from '@yanxuebao/types';
import type { AuthenticatedUser } from '../security/auth.types';
import { AppDataService } from './app-data.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly appDataService: AppDataService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWeb(payload: AccountPasswordLoginDto) {
    const user = await this.appDataService.validateWebLogin(payload);
    return this.issueSession(user);
  }

  async loginDevice(payload: DeviceAuthorizationCodeLoginDto) {
    const user = await this.appDataService.validateDeviceLogin(payload);
    return this.issueSession(user);
  }

  async refreshSession(refreshToken: string) {
    const payload = this.jwtService.verify<AuthenticatedUser>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'yanxuebao-refresh-dev-secret',
    });

    const user = await this.appDataService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Refresh token user not found');
    }
    return this.issueSession(user);
  }

  async getProfile(userId: string) {
    const user = await this.appDataService.findUserById(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      account: user.account,
      role: user.role,
      displayName: user.displayName,
      studentId: user.studentId,
    };
  }

  private issueSession(user: {
    id: string;
    account: string;
    role: string;
    displayName: string;
    studentId?: string;
  }) {
    const accessPayload: AuthenticatedUser = {
      sub: user.id,
      account: user.account,
      role: user.role as AuthenticatedUser['role'],
      displayName: user.displayName,
      studentId: user.studentId,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'yanxuebao-access-dev-secret',
      expiresIn: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900),
    });

    const refreshToken = this.jwtService.sign(accessPayload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'yanxuebao-refresh-dev-secret',
      expiresIn: Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 604800),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      role: accessPayload.role,
      user: {
        id: user.id,
        account: user.account,
        displayName: user.displayName,
        role: accessPayload.role,
        studentId: user.studentId,
      },
    };
  }
}

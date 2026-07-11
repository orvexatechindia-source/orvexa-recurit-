import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '@orvexa/auth';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Return user without password
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Access token (expires in e.g. 1 hour)
    const accessToken = this.jwtService.sign({ ...payload } as any, {
      secret: process.env.JWT_SECRET || 'orvexa-recruit-local-dev-secret-key-very-secure',
      expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any,
    });

    // Refresh token (expires in e.g. 7 days)
    const refreshToken = this.jwtService.sign(
      { sub: user.id, tenantId: user.tenantId } as any,
      {
        secret: process.env.JWT_REFRESH_SECRET || 'orvexa-recruit-local-dev-refresh-secret-key-very-secure',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'orvexa-recruit-local-dev-refresh-secret-key-very-secure',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user || user.tenantId !== decoded.tenantId) {
        throw new UnauthorizedException('Invalid session.');
      }

      // Re-sign access and refresh tokens
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Session expired or invalid.');
    }
  }
}

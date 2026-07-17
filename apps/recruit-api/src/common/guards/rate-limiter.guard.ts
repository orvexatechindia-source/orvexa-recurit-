import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private static requests = new Map<string, { count: number; expiresAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
    const path = request.route.path;
    const key = `${ip}:${path}`;

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10; // Max 10 requests per minute for public endpoints

    const record = RateLimiterGuard.requests.get(key);

    if (!record || now > record.expiresAt) {
      RateLimiterGuard.requests.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return true;
    }

    if (record.count >= maxRequests) {
      throw new HttpException(
        'Too many requests. Please try again after 60 seconds.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with support for dynamic subdomain resolution
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      
      const allowedHosts = [
        'localhost:3000',
        'orvexatech.online',
        'orvexarecruit.com',
        'app.orvexarecruit.com'
      ];
      
      const parsedOrigin = new URL(origin);
      const host = parsedOrigin.host; // e.g. "lhalondon.localhost:3000" or "app.orvexarecruit.com"
      
      const isAllowed = allowedHosts.includes(host) ||
        host.endsWith('.localhost:3000') ||
        host.endsWith('.orvexatech.online') ||
        host.endsWith('.orvexarecruit.com');
        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  // Serve candidate resume documents statically
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

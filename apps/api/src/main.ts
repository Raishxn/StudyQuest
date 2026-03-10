import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SanitizationInterceptor } from './common/interceptors/sanitization.interceptor';
import { ResponseSanitizationInterceptor } from './common/interceptors/response-sanitization.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Helmet Security Headers (CSP, noSniff, frameguard, HSTS)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*.r2.dev"],
        connectSrc: ["'self'", "wss://"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    noSniff: true,
    frameguard: { action: 'deny' },
  }));

  // 2. Configure CORS
  const frontendUrlStr = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = frontendUrlStr.split(',').map(u => u.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      // or if origin is in our allowed list, or if allowedOrigins contains '*'
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });

  // 3. Global Validation Pipe (Whitelist, Forbid Extra, Transform)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Global Exception Filter (RFC 7807)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Global Interceptors (Sanitize Request & Response)
  app.useGlobalInterceptors(
    new SanitizationInterceptor(),
    new ResponseSanitizationInterceptor()
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

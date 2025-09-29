import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const start = Date.now();
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (response.headersSent) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;

        if (!response.headersSent) {
          response.setHeader('X-Elapsed-Time', `${elapsed}ms`);
        }

        response.locals.elapsedTime = elapsed;
        console.log(`Request took ${elapsed}ms`);
      })
    );
  }
}
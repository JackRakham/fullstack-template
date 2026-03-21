import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AlsService } from '../als.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly alsService: AlsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const ipAddress = request.ip || request.headers['x-forwarded-for'];

    return new Observable((observer) => {
      this.alsService.runWithContext({ userId, ipAddress }, () => {
        next.handle().subscribe({
          next: (res) => observer.next(res),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}

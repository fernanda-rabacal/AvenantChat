import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException
} from "@nestjs/common";
import { catchError, Observable } from "rxjs";
import { SystemError } from "../types/SystemError";

@Injectable()
export class SystemInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof SystemError) {
          throw new InternalServerErrorException(error.message);
        } else {
          throw error;
        }
      }),
    );
  }
}

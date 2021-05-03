//httpConfig.interceptor.ts
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
  import { Observable, throwError } from 'rxjs';
  import { map, catchError } from 'rxjs/operators';
  import { Injectable } from '@angular/core';
  
  @Injectable()
  export class HttpConfigInterceptor implements HttpInterceptor {
    
    constructor() { }
  
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const token = "394772d23dfb455a9fc5ee31ce8ee53a";
      if (token) {
        request = request.clone({ headers: request.headers.set('accessKey', token)});
      }

      request.headers.set('Access-Control-Allow-Origin', '*')
      request.headers.set('X-Requested-With', 'XMLHttpRequest');
  
      if (!request.headers.has('Content-Type')) {
        request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
      }
  
      request = request.clone({
        headers: request.headers.set('Accept', 'application/json')
      });
  
      return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
          return event;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          return throwError(error);
        }));
    }
  }
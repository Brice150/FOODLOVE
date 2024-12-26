import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { ConnectService } from '../services/connect.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const connectService = inject(ConnectService);

  if (!req.url.includes('/login')) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!error.url?.includes('/registration')) {
          connectService.logout();
          if (error.status === 403) {
            toastr.error('You are not allowed to do this action', 'Forbidden', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          } else if (error.status === 401) {
            toastr.error('Please login again', 'Unauthorized', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          } else if (
            error.url?.includes('notification/all') &&
            error.status === 500
          ) {
            toastr.error(
              'Your account has been deleted by an admin',
              'Account Deleted',
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          } else {
            toastr.error(error.message, 'Error', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        } else {
          toastr.error(error.error, 'Error', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom error',
          });
        }
        return throwError(() => error);
      })
    );
  } else {
    return next(req);
  }
};

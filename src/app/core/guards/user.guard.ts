import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectService } from '../services/connect.service';

export const userGuard: CanActivateFn = (route, state) => {
  const connectService = inject(ConnectService);
  const router = inject(Router);

  if (true) {
    return true;
  } else {
    /*
    return new Observable<boolean>((observer) => {
      connectService.getConnectedUser().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          router.navigate(['/']);
          observer.next(false);
          observer.complete();
        },
      });
    });
    */
  }
};

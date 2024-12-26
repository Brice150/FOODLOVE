import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectService } from '../services/connect.service';

export const adminGuard: CanActivateFn = (route, state) => {
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
          router.navigate(['/select']);
          observer.next(false);
          observer.complete();
        },
      });
    });
    */
  }
};

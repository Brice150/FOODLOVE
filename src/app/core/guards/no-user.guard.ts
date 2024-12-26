import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConnectService } from '../services/connect.service';

export const noUserGuard: CanActivateFn = (route, state) => {
  const connectService = inject(ConnectService);
  const router = inject(Router);

  if (false) {
    return true;
  } else {
    router.navigate(['/recipes']);
    return false;
  }
};

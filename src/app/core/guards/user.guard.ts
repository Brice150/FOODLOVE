import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const userGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.getUser();
  if (user && user.email) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};

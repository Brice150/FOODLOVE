import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const userGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const waitForUser = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkUser = () => {
        const user = userService.currentUserSig();

        if (user !== undefined) {
          if (user) {
            resolve(true);
          } else {
            router.navigate(['/']);
            resolve(false);
          }
        } else {
          setTimeout(checkUser, 100);
        }
      };

      checkUser();
    });
  };

  return waitForUser();
};

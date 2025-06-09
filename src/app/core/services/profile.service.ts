import { inject, Injectable } from '@angular/core';
import { deleteUser, updatePassword, updateProfile } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { RecipeService } from './recipe.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  recipeService = inject(RecipeService);
  userService = inject(UserService);

  updateProfile(user: User): Observable<void> {
    const currentUser = this.userService.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('User not logged in'));
    }

    if (!user.password) {
      return from(Promise.reject('Empty password'));
    }

    const promise = updatePassword(currentUser, user.password).then(() => {
      this.userService.currentUserSig.set({
        email: user.email,
      });
    });

    return from(promise);
  }

  deleteProfile(): Observable<void> {
    const currentUser = this.userService.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('Utilisateur non connecté.'));
    }

    const promise = deleteUser(currentUser);

    return from(promise);
  }
}

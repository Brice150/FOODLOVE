import { inject, Injectable } from '@angular/core';
import {
  deleteUser,
  signOut,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
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
      return from(Promise.reject('Utilisateur non connecté.'));
    }

    const updateTasks: Promise<void>[] = [];

    if (user.username && user.username !== currentUser.displayName) {
      updateTasks.push(
        updateProfile(currentUser, { displayName: user.username })
      );
    }

    if (user.password) {
      updateTasks.push(updatePassword(currentUser, user.password));
    }

    const promise = Promise.all(updateTasks).then(() => {
      this.userService.currentUserSig.set({
        email: user.email,
        username: user.username,
      });
    });

    return from(promise);
  }

  deleteProfile(): Observable<void> {
    const currentUser = this.userService.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('Utilisateur non connecté.'));
    }

    const promise = deleteUser(currentUser).then(() => {
      return signOut(this.userService.auth).then(() => {
        this.userService.currentUserSig.set(null);
      });
    });

    return from(promise);
  }
}

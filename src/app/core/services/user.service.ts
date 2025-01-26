import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  auth = inject(Auth);
  user$ = user(this.auth);
  currentUserSig = signal<User | null | undefined>(undefined);

  register(user: User): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.auth,
      user.email,
      user.password!
    ).then((response) =>
      updateProfile(response.user, { displayName: user.username }).then(() => {
        this.currentUserSig.set({
          email: response.user.email!,
          username: response.user.displayName!,
        });
      })
    );

    return from(promise);
  }

  login(user: User): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.auth,
      user.email,
      user.password!
    ).then((response) => {
      this.currentUserSig.set({
        email: response.user.email!,
        username: response.user.displayName!,
      });
    });

    return from(promise);
  }

  updateProfile(user: User): Observable<void> {
    const currentUser = this.auth.currentUser;

    console.log(currentUser);

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
      this.currentUserSig.set({
        email: user.email,
        username: user.username,
      });
    });

    return from(promise);
  }

  deleteProfile(): Observable<void> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('Utilisateur non connecté.'));
    }

    const promise = deleteUser(currentUser).then(() => {
      return signOut(this.auth).then(() => {
        this.currentUserSig.set(null);
      });
    });

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.auth);
    this.currentUserSig.set(null);

    return from(promise);
  }
}

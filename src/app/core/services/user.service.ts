import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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

  logout(): Observable<void> {
    const promise = signOut(this.auth);
    this.currentUserSig.set(null);

    return from(promise);
  }
}

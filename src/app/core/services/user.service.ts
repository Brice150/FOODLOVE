import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
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
    ).then((response) => {
      this.currentUserSig.set({
        email: response.user.email!,
      });
    });

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
      });
    });

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.auth);
    this.currentUserSig.set(null);

    return from(promise);
  }

  passwordReset(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.auth, email);
    return from(promise);
  }
}

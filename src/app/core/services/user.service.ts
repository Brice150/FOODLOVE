import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user: User = {} as User;

  getUser(): User {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    return this.user;
  }

  saveUserDarkMode(prefersDarkMode: boolean): void {
    this.user = this.getUser();
    this.user.prefersDarkMode = prefersDarkMode;
    this.saveUser();
  }

  login(): void {
    this.setDefaultUser();
    this.saveUser();
  }

  register(): void {
    this.setDefaultUser();
    this.saveUser();
  }

  logout(): void {
    this.user = {} as User;
    localStorage.removeItem('userFoodlove');
  }

  private getStoredUser(): User | null {
    let storedUser: string | null = localStorage.getItem('userFoodlove');
    if (storedUser !== null) {
      return JSON.parse(storedUser);
    } else {
      return null;
    }
  }

  private setDefaultUser(): void {
    this.user.email = 'test@gmail.com';
    this.user.password = 'password';
    this.user.role = 'ADMIN';
    this.user.username = 'User1';
    this.user.prefersDarkMode = false;
  }

  private saveUser(): void {
    localStorage.setItem('userFoodlove', JSON.stringify(this.user));
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { User } from './core/interfaces/user';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  user: User = {} as User;
  userService = inject(UserService);
  router = inject(Router);

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.handleMode();
  }

  handleMode(): void {
    if (this.user.prefersDarkMode) {
      document.body.classList.add('dark-theme-variables');
    } else {
      document.body.classList.remove('dark-theme-variables');
    }
  }

  handleOpenCloseNav(): void {
    const contents = document.querySelector('.contents');
    if (contents) {
      contents.classList.toggle('close');
    }
  }

  changeMode(): void {
    document.body.classList.toggle('dark-theme-variables');
    this.user = this.userService.getUser();
    this.user.prefersDarkMode = !this.user.prefersDarkMode;
    this.userService.saveUserDarkMode(this.user.prefersDarkMode);
  }

  logout(): void {
    this.userService.logout();
    this.user = this.userService.getUser();
    const contents = document.querySelector('.contents');
    if (contents) {
      contents.classList.add('close');
    }
    this.router.navigate(['/']);
  }
}

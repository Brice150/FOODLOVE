import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { NavComponent } from './nav/nav.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  userService = inject(UserService);
  router = inject(Router);
  toastr = inject(ToastrService);
  prefersDarkMode: boolean = false;
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (user) => {
        if (user) {
          this.userService.currentUserSig.set({
            email: user.email!,
            username: user.displayName!,
          });
        } else {
          this.userService.currentUserSig.set(null);
        }
        this.handleMode();
      },
      error: (error: HttpErrorResponse) => {
        if (!error.message.includes('Missing or insufficient permissions.')) {
          this.toastr.error(error.message, 'Connexion', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom error',
          });
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  handleMode(): void {
    if (!localStorage.getItem('foodLovePrefersDarkMode')) {
      localStorage.setItem('foodLovePrefersDarkMode', 'false');
      this.prefersDarkMode = false;
    }

    this.prefersDarkMode = localStorage
      .getItem('foodLovePrefersDarkMode')!
      .includes('true');

    if (this.prefersDarkMode) {
      document.body.classList.add('dark-theme-variables');
    } else {
      document.body.classList.remove('dark-theme-variables');
    }
  }

  handleOpenCloseNav(): void {
    const contents = document.querySelector('.contents');
    if (contents && contents.classList.contains('enable')) {
      contents.classList.toggle('open');
    }
  }

  changeMode(): void {
    if (!this.prefersDarkMode) {
      localStorage.setItem('foodLovePrefersDarkMode', 'true');
      document.body.classList.add('dark-theme-variables');
    } else {
      localStorage.setItem('foodLovePrefersDarkMode', 'false');
      document.body.classList.remove('dark-theme-variables');
    }
    this.prefersDarkMode = !this.prefersDarkMode;
  }

  logout(): void {
    this.userService
      .logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Déconnexion', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);
  translateService = inject(TranslateService);
  hide: boolean = true;
  invalidLogin: boolean = false;
  destroyed$ = new Subject<void>();
  loading: boolean = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(40),
        ],
      ],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.userService
        .login(this.loginForm.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/recipes/selection']);
            this.toastr.info(
              this.translateService.instant('toastr.welcome'),
              this.translateService.instant('title'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom info',
              }
            );
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (error.message.includes('auth/invalid-credential')) {
              this.invalidLogin = true;
              this.toastr.error(
                this.translateService.instant('toastr.validation-error'),
                this.translateService.instant('title'),
                {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                }
              );
              setTimeout(() => {
                this.invalidLogin = false;
              }, 2000);
            } else {
              if (
                !error.message.includes('Missing or insufficient permissions.')
              ) {
                this.toastr.error(
                  error.message,
                  this.translateService.instant('title'),
                  {
                    positionClass: 'toast-bottom-center',
                    toastClass: 'ngx-toastr custom error',
                  }
                );
              }
            }
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  loginWithGoogle(): void {
    this.userService
      .signInWithGoogle()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/recipes/selection']);
          this.toastr.info(
            this.translateService.instant('toastr.welcome'),
            this.translateService.instant('title'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          if (
            !error.message.includes('Missing or insufficient permissions.') &&
            !error.message.includes('auth/popup-closed-by-user')
          ) {
            this.toastr.error(
              error.message,
              this.translateService.instant('title'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  passwordForgotten(): void {
    if (this.loginForm.get('email')?.valid) {
      this.loading = true;
      this.userService
        .passwordReset(this.loginForm.value?.email)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastr.info(
              this.translateService.instant('toastr.reset'),
              this.translateService.instant('title'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom info',
              }
            );
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(
                error.message,
                this.translateService.instant('title'),
                {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                }
              );
            }
          },
        });
    } else {
      this.loginForm.get('email')?.markAsTouched();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';

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
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);
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
            this.toastr.info('Welcome', 'Foodlove', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (error.message.includes('auth/invalid-credential')) {
              this.invalidLogin = true;
              this.toastr.error('Wrong email or password', 'Login', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
              setTimeout(() => {
                this.invalidLogin = false;
              }, 2000);
            } else {
              if (
                !error.message.includes('Missing or insufficient permissions.')
              ) {
                this.toastr.error(error.message, 'Login', {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                });
              }
            }
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
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
              'A password reset email has been sent to your email address',
              'Foodlove',
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
              this.toastr.error(error.message, 'Login', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.loginForm.get('email')?.markAsTouched();
    }
  }
}

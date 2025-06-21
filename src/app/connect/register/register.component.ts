import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);
  translateService = inject(TranslateService);
  hide: boolean = true;
  hideDuplicate: boolean = true;
  destroyed$ = new Subject<void>();
  loading: boolean = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
          ],
        ],
        passwordConfirmation: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
          ],
        ],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): void {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('passwordConfirmation')?.value;

    if (
      control.get('password')!.valid &&
      passwordConfirmation &&
      passwordConfirmation !== '' &&
      password !== passwordConfirmation &&
      !control.get('passwordConfirmation')!.hasError('minlength') &&
      !control.get('passwordConfirmation')!.hasError('maxlength')
    ) {
      control
        .get('passwordConfirmation')
        ?.setErrors({ passwordMismatch: true });
    }
  }

  register(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.userService
        .register(this.registerForm.value)
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
      this.registerForm.markAllAsTouched();
    }
  }
}

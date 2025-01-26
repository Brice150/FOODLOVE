import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../core/services/user.service';
import { User } from '../core/interfaces/user';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { filter, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
})
export class ProfilComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  dialog = inject(MatDialog);
  router = inject(Router);
  hide: boolean = true;
  hideDuplicate: boolean = true;
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.profileForm = this.fb.group(
      {
        username: [
          this.userService.currentUserSig()!.username,
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(40),
          ],
        ],
        email: [
          { value: this.userService.currentUserSig()!.email, disabled: true },
        ],
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.userService
        .updateProfile(this.profileForm.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.toastr.info('Profil modifié', 'Profil', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            if (error.message.includes('auth/requires-recent-login')) {
              this.toastr.info(
                'Veuillez vous déconnecter et reconnecter pour modifier le profil',
                'Profil',
                {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                }
              );
            } else {
              this.toastr.info(error.message, 'Profil', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'supprimer votre profil',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res: boolean) => res))
      .subscribe(() => {
        this.userService
          .deleteProfile()
          .pipe(takeUntil(this.destroyed$))
          .subscribe({
            next: () => {
              this.router.navigate(['/']);
              this.toastr.info('Profil supprimé', 'Profil', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom info',
              });
            },
            error: (error: HttpErrorResponse) => {
              if (error.message.includes('auth/requires-recent-login')) {
                this.toastr.info(
                  'Veuillez vous déconnecter et reconnecter pour effectuer cette action',
                  'Profil',
                  {
                    positionClass: 'toast-bottom-center',
                    toastClass: 'ngx-toastr custom error',
                  }
                );
              } else {
                this.toastr.info(error.message, 'Profil', {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                });
              }
            },
          });
      });
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
}

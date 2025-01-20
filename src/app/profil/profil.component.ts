import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { filter } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';

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
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  userService = inject(UserService);
  dialog = inject(MatDialog);
  router = inject(Router);
  user: User = {} as User;
  hide: boolean = true;
  hideDuplicate: boolean = true;

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.profileForm = this.fb.group(
      {
        username: [
          this.user.username,
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(40),
          ],
        ],
        email: [this.user.email, [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(40),
          ],
        ],
        passwordConfirmation: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(40),
          ],
        ],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.userService.saveProfile(this.profileForm.value);
      this.toastr.info('Profil modifié', 'Profil', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom info',
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
        this.userService.deleteUser();
        location.reload();
        this.toastr.info('Profil supprimé', 'Profil', {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom info',
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

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { User } from '../core/interfaces/user';
import { ProfileService } from '../core/services/profile.service';
import { RecipeService } from '../core/services/recipe.service';
import { ShoppingService } from '../core/services/shopping.service';
import { UserService } from '../core/services/user.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SecurityDialogComponent } from '../shared/components/security-dialog/security-dialog.component';
import { SecurityComponent } from './security/security.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    TranslateModule,
    SecurityComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnDestroy {
  toastr = inject(ToastrService);
  profileService = inject(ProfileService);
  userService = inject(UserService);
  recipeService = inject(RecipeService);
  shoppingService = inject(ShoppingService);
  dialog = inject(MatDialog);
  router = inject(Router);
  translateService = inject(TranslateService);
  destroyed$ = new Subject<void>();
  loading: boolean = false;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openUpdateDialog(): void {
    const dialogRef = this.dialog.open(SecurityDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((user: User) => {
          this.loading = true;
          user.email = this.userService.currentUserSig()?.email!;
          return this.profileService.updateProfile(user);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.profile.updated'),
            this.translateService.instant('nav.profile'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (error.message.includes('auth/requires-recent-login')) {
            this.toastr.error(
              this.translateService.instant('toastr.login-logout'),
              this.translateService.instant('nav.profile'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          } else {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.profile'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'actions.delete.profile',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.shoppingService.deleteUserShopping();
        }),
        switchMap(() => this.recipeService.deleteUserRecipes()),
        switchMap(() =>
          this.profileService.deleteProfile().pipe(
            catchError(() => {
              return of(undefined);
            })
          )
        ),
        switchMap(() =>
          this.userService.logout().pipe(
            catchError(() => {
              return of(undefined);
            })
          )
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/']);
          this.toastr.info(
            this.translateService.instant('toastr.profile.deleted'),
            this.translateService.instant('nav.profile'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (error.message.includes('auth/requires-recent-login')) {
            this.toastr.error(
              this.translateService.instant('toastr.login-logout'),
              this.translateService.instant('nav.profile'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          } else {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.profile'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }
}

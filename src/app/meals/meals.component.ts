import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { DayOfWeek } from '../core/enums/day-of-week';
import { Meal } from '../core/interfaces/meal';
import { MealService } from '../core/services/meal.service';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { EditMealsDialogComponent } from '../shared/components/edit-meals-dialog/edit-meals-dialog.component';
import { StrikeThroughDirective } from '../shared/directives/strike-through.directive';

@Component({
  selector: 'app-meals',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    TranslateModule,
    MatChipsModule,
    StrikeThroughDirective,
  ],
  templateUrl: './meals.component.html',
  styleUrl: './meals.component.css',
})
export class MealsComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  mealService = inject(MealService);
  pdfGeneratorService = inject(PdfGeneratorService);
  translateService = inject(TranslateService);
  toastr = inject(ToastrService);
  meals: Meal[] = [];
  dialog = inject(MatDialog);
  categories: DayOfWeek[] = Object.values(DayOfWeek);

  ngOnInit(): void {
    this.mealService
      .getMeals()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (meals: Meal[]) => {
          if (meals?.length > 0) {
            this.setMeals(meals);
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.meals'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  toggleChecked(meal: Meal): void {
    meal.checked = !meal.checked;

    this.mealService.updateMeal(meal).subscribe();
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF('to-download', 'Repas.pdf');
    this.toastr.info(
      this.translateService.instant('toastr.meals.downloaded'),
      this.translateService.instant('nav.meals'),
      {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom info',
      }
    );
  }

  openDialog(message: string, isDeleteMode: boolean): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: message,
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res: boolean) => res))
      .subscribe({
        next: () => {
          if (isDeleteMode) {
            this.deleteMeals();
          } else {
            this.cleanMeals();
          }
        },
      });
  }

  setMeals(meals: Meal[]): void {
    const dayOrder = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ];

    this.meals = meals.sort((a, b) => {
      const dayComparison =
        dayOrder.indexOf(a.dayOfWeek as DayOfWeek) -
        dayOrder.indexOf(b.dayOfWeek as DayOfWeek);

      if (dayComparison !== 0) {
        return dayComparison;
      }

      return a.order - b.order;
    });
  }

  editMeals(): void {
    const dialogRef = this.dialog.open(EditMealsDialogComponent, {
      data: this.meals,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Meal[]) => {
          this.loading = true;

          const mealsToDelete = this.meals.filter(
            (meal) => !res.some((m) => m.id === meal.id)
          );

          res.forEach((meal, index) => {
            meal.order = index + 1;
          });

          if (mealsToDelete.length) {
            return this.mealService
              .deleteMeals(mealsToDelete)
              .pipe(switchMap(() => this.mealService.editMeals(res)));
          } else {
            return this.mealService.editMeals(res);
          }
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.setMeals([...this.meals]);
          this.toastr.info(
            this.translateService.instant('toastr.meals.edited'),
            this.translateService.instant('nav.meals'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.meals'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  cleanMeals(): void {
    const mealsToDelete = this.meals.filter((meal) => meal.checked);
    const mealsToKeep = this.meals.filter((meal) => !meal.checked);

    if (!mealsToDelete.length) {
      this.toastr.info(
        this.translateService.instant('toastr.meals.cleaned'),
        this.translateService.instant('nav.meals'),
        {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom info',
        }
      );
      return;
    }

    this.loading = true;

    this.mealService
      .deleteMeals(mealsToDelete)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.setMeals(mealsToKeep);
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.meals.cleaned'),
            this.translateService.instant('nav.meals'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.meals'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  deleteMeals(): void {
    this.loading = true;
    this.mealService
      .deleteUserMeals()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.meals = [];
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.meals.deleted'),
            this.translateService.instant('nav.meals'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.meals'),
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

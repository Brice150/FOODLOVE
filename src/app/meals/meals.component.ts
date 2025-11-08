import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, takeUntil } from 'rxjs';
import { DayOfWeek } from '../core/enums/day-of-week';
import { Meal } from '../core/interfaces/meal';
import { MealCategory } from '../core/interfaces/meal-category';
import { MealService } from '../core/services/meal.service';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
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
  categories: MealCategory[] = [];

  ngOnInit(): void {
    this.mealService
      .getMeals()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (meals: Meal[]) => {
          if (meals?.length > 0) {
            this.meals = meals;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.shopping'),
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
    this.pdfGeneratorService.generatePDF('to-download', 'Ingrédients.pdf');
    this.toastr.info(
      this.translateService.instant('toastr.shopping.downloaded'),
      this.translateService.instant('nav.shopping'),
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

  createCategories(meals: Meal[]): void {
    this.meals = meals.sort((a, b) => {
      const categoryComparison = a.day.localeCompare(b.day);
      return categoryComparison !== 0
        ? categoryComparison
        : a.name.localeCompare(b.name);
    });

    const grouped = this.meals.reduce(
      (acc: Map<string, Meal[]>, meal: Meal) => {
        if (!acc.has(meal.day)) {
          acc.set(meal.day, []);
        }
        acc.get(meal.day)!.push(meal);
        return acc;
      },
      new Map<string, Meal[]>()
    );

    this.categories = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dayOfWeek, meals]) => ({
        dayOfWeek: dayOfWeek as DayOfWeek,
        meals,
      }));
  }

  editMeals(): void {}

  cleanMeals(): void {
    const mealsToDelete = this.meals.filter((meal) => meal.checked);
    const mealsToKeep = this.meals.filter((meal) => !meal.checked);

    if (!mealsToDelete.length) {
      this.toastr.info(
        this.translateService.instant('toastr.shopping.cleaned'),
        this.translateService.instant('nav.shopping'),
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
          this.createCategories(mealsToKeep);
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.shopping.cleaned'),
            this.translateService.instant('nav.shopping'),
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
              this.translateService.instant('nav.shopping'),
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
          this.categories = [];
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.shopping.deleted'),
            this.translateService.instant('nav.shopping'),
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
              this.translateService.instant('nav.shopping'),
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

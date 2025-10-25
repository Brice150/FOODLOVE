import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { IngredientCategory } from '../core/enums/ingredient-category';
import { Category } from '../core/interfaces/category';
import { Ingredient } from '../core/interfaces/ingredient';
import { IngredientService } from '../core/services/ingredient.service';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { AddIngredientsDialogComponent } from '../shared/components/add-ingredients-dialog/add-ingredients-dialog.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { IngredientDialogComponent } from '../shared/components/ingredient-dialog/ingredient-dialog.component';
import { StrikeThroughDirective } from './strike-through.directive';

@Component({
  selector: 'app-shopping',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    StrikeThroughDirective,
    MatExpansionModule,
    TranslateModule,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent implements OnInit, OnDestroy {
  toastr = inject(ToastrService);
  ingredientService = inject(IngredientService);
  pdfGeneratorService = inject(PdfGeneratorService);
  translateService = inject(TranslateService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  ingredients: Ingredient[] = [];
  categories: Category[] = [];
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.ingredientService
      .getIngredients()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (ingredients: Ingredient[]) => {
          if (ingredients?.length > 0) {
            this.createCategories(ingredients);
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

  createCategories(ingredients: Ingredient[]): void {
    this.ingredients = ingredients.sort((a, b) => {
      const categoryComparison = a.category.localeCompare(b.category);
      return categoryComparison !== 0
        ? categoryComparison
        : a.name.localeCompare(b.name);
    });

    const grouped = this.ingredients.reduce(
      (acc: Map<string, Ingredient[]>, ingredient: Ingredient) => {
        if (!acc.has(ingredient.category)) {
          acc.set(ingredient.category, []);
        }
        acc.get(ingredient.category)!.push(ingredient);
        return acc;
      },
      new Map<string, Ingredient[]>()
    );

    this.categories = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ingredients]) => ({
        category: category as IngredientCategory,
        ingredients,
      }));
  }

  addIngredients(): void {
    const dialogRef = this.dialog.open(AddIngredientsDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Ingredient[]) => {
          this.loading = true;
          return this.ingredientService.addIngredients(res);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.shopping.added'),
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

  updateIngredient(ingredient: Ingredient): void {
    const dialogRef = this.dialog.open(IngredientDialogComponent, {
      data: structuredClone(ingredient),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Ingredient) => {
          this.loading = true;
          return this.ingredientService.updateIngredient(res);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.shopping.updated'),
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

  toggleChecked(ingredient: Ingredient): void {
    ingredient.checked = !ingredient.checked;

    this.ingredientService.updateIngredient(ingredient).subscribe();
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
            this.deleteIngredients();
          } else {
            this.cleanIngredients();
          }
        },
      });
  }

  cleanIngredients(): void {
    const ingredientsToDelete = this.ingredients.filter(
      (ingredient) => ingredient.checked
    );
    const ingredientsToKeep = this.ingredients.filter(
      (ingredient) => !ingredient.checked
    );

    if (!ingredientsToDelete.length) {
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

    this.ingredientService
      .deleteIngredients(ingredientsToDelete)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.createCategories(ingredientsToKeep);
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

  deleteIngredients(): void {
    this.loading = true;
    this.ingredientService
      .deleteUserIngredients()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.ingredients = [];
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

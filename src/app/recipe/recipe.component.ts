import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, take, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { RecipeType } from '../core/enums/recipe-type';
import { Ingredient } from '../core/interfaces/ingredient';
import { Recipe } from '../core/interfaces/recipe';
import { Step } from '../core/interfaces/step';
import { IngredientService } from '../core/services/ingredient.service';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { EditRecipeDialogComponent } from '../shared/components/edit-recipe-dialog/edit-recipe-dialog.component';
import { StrikeThroughDirective } from '../shared/directives/strike-through.directive';

@Component({
  selector: 'app-recipe',
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    StrikeThroughDirective,
    MatCheckboxModule,
    TranslateModule,
  ],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.css',
})
export class RecipeComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  recipeService = inject(RecipeService);
  recipe: Recipe = {} as Recipe;
  destroyed$ = new Subject<void>();
  imagePath: string = environment.imagePath;
  dialog = inject(MatDialog);
  router = inject(Router);
  toastr = inject(ToastrService);
  translateService = inject(TranslateService);
  pdfGeneratorService = inject(PdfGeneratorService);
  ingredientService = inject(IngredientService);
  loading: boolean = true;
  RecipeType = RecipeType;

  ngOnInit(): void {
    this.recipe.name = 'Recette';
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const recipeId = params['id'];
          return this.recipeService.getRecipe(recipeId);
        }),
        filter((recipe) => !!recipe)
      )
      .subscribe({
        next: (recipe) => {
          if (recipe.ingredients?.length > 0) {
            recipe.ingredients.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (recipe.steps?.length > 0) {
            recipe.steps.sort((a, b) => a.order - b.order);
          }
          this.recipe = recipe;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('form.recipe'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          } else {
            this.router.navigate(['/recipes/selection']);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'actions.delete.recipe',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.recipeService.deleteRecipe(this.recipe.id);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([`/recipes/${this.recipe.type}`]);
          this.toastr.info(
            this.translateService.instant('toastr.recipe.deleted'),
            this.translateService.instant('form.recipe'),
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
              this.translateService.instant('form.recipe'),
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
    this.pdfGeneratorService.generatePDF(
      'to-download',
      this.recipe.name + '.pdf'
    );
    this.toastr.info(
      this.translateService.instant('toastr.recipe.downloaded'),
      this.translateService.instant('form.recipe'),
      {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom info',
      }
    );
  }

  export(): void {
    const { id, userId, ...exportedRecipe } = this.recipe;
    const blob = new Blob([JSON.stringify(exportedRecipe, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportedRecipe.name}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.toastr.info(
      this.translateService.instant('toastr.recipe.exported'),
      this.translateService.instant('form.recipe'),
      {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom info',
      }
    );
  }

  toggleChecked(element: Ingredient | Step): void {
    element.checked = !element.checked;
  }

  toggleCheckAll(): void {
    if (this.isAllTicked()) {
      this.recipe.ingredients.forEach((ingredient) => {
        ingredient.checked = false;
      });
      return;
    }
    this.recipe.ingredients.forEach((ingredient) => {
      ingredient.checked = true;
    });
  }

  isAllTicked(): boolean {
    return this.recipe.ingredients.every((ingredient) => ingredient.checked);
  }

  addToShoppingList(): void {
    const ingredientsToAdd = this.recipe.ingredients.filter(
      (ingredient) => ingredient.checked
    );

    if (ingredientsToAdd.length === 0) {
      this.toastr.error(
        this.translateService.instant('toastr.recipe.check-error'),
        this.translateService.instant('form.recipe'),
        {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom error',
        }
      );
      return;
    }

    this.loading = true;

    ingredientsToAdd.forEach((ingredient) => (ingredient.checked = false));

    this.ingredientService
      .addIngredients(ingredientsToAdd)
      .pipe(takeUntil(this.destroyed$), take(1))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/shopping']);
          this.toastr.info(
            this.translateService.instant('toastr.shopping.ready'),
            this.translateService.instant('nav.shopping'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('form.recipe'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  updateRecipe(): void {
    const dialogRef = this.dialog.open(EditRecipeDialogComponent, {
      data: this.recipe,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Recipe) => {
          this.loading = true;
          return this.recipeService.updateRecipe(res);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (recipe: Recipe) => {
          this.recipe = recipe;
          this.loading = false;
          this.toastr.info(
            this.translateService.instant('toastr.recipe.updated'),
            this.translateService.instant('form.recipe'),
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
              this.translateService.instant('form.recipe'),
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

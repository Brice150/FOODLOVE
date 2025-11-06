import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Recipe } from '../../../core/interfaces/recipe';
import { Step } from '../../../core/interfaces/step';
import { RecipeService } from '../../../core/services/recipe.service';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';

@Component({
  selector: 'app-edit-recipe-dialog',
  imports: [
    CommonModule,
    RouterModule,
    RecipeFormComponent,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './edit-recipe-dialog.component.html',
  styleUrl: './edit-recipe-dialog.component.css',
})
export class EditRecipeDialogComponent implements OnInit, OnDestroy {
  recipeService = inject(RecipeService);
  router = inject(Router);
  toastr = inject(ToastrService);
  activatedRoute = inject(ActivatedRoute);
  translateService = inject(TranslateService);
  destroyed$ = new Subject<void>();
  recipe: Recipe = {} as Recipe;

  constructor(
    public dialogRef: MatDialogRef<EditRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        filter((params) => !!params['id']),
        switchMap((params) => {
          const recipeId = params['id'];
          return this.recipeService.getRecipe(recipeId);
        })
      )
      .subscribe({
        next: (recipe) => {
          if (recipe.ingredients.length > 0) {
            recipe.ingredients.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (recipe.steps.length > 0) {
            recipe.steps?.sort((a, b) => a.order - b.order);
          }
          this.recipe = recipe;
        },
        error: (error: HttpErrorResponse) => {
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addRecipe(newRecipe: Recipe): void {
    if (newRecipe.picture === undefined) {
      newRecipe.picture = null;
    }

    newRecipe.steps.forEach((step: Step, i: number) => {
      step.order = i;
    });

    this.recipeService
      .addRecipe(newRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (recipeId: string) => {
          this.router.navigate([`/recipes/${newRecipe.type}/${recipeId}`]);
          this.toastr.info(
            this.translateService.instant('toastr.recipe.added'),
            this.translateService.instant('form.recipe'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
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

  importRecipes(newRecipes: Recipe[]): void {
    let completedRequests = 0;
    newRecipes.forEach((newRecipe) => {
      newRecipe.steps.forEach((step: Step, i: number) => {
        step.order = i;
      });

      this.recipeService
        .addRecipe(newRecipe)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            completedRequests++;

            if (completedRequests === newRecipes.length) {
              this.router.navigate(['/recipes/selection']);
              this.toastr.info(
                this.translateService.instant('toastr.recipe.imported'),
                this.translateService.instant('form.recipe'),
                {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom info',
                }
              );
            }
          },
          error: (error: HttpErrorResponse) => {
            completedRequests++;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
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
    });
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.recipeService
      .updateRecipe(updatedRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate([
            `/recipes/${updatedRecipe.type}/${updatedRecipe.id}`,
          ]);
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

  cancel(): void {
    this.dialogRef.close(false);
  }
}

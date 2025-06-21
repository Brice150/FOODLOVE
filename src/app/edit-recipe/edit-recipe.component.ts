import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Recipe } from '../core/interfaces/recipe';
import { Step } from '../core/interfaces/step';
import { RecipeService } from '../core/services/recipe.service';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-recipe',
  imports: [
    CommonModule,
    RouterModule,
    RecipeFormComponent,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './edit-recipe.component.html',
  styleUrl: './edit-recipe.component.css',
})
export class EditRecipeComponent implements OnInit, OnDestroy {
  recipeService = inject(RecipeService);
  router = inject(Router);
  toastr = inject(ToastrService);
  activatedRoute = inject(ActivatedRoute);
  destroyed$ = new Subject<void>();
  recipe: Recipe = {} as Recipe;
  loading: boolean = false;

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        filter((params) => !!params['id']),
        switchMap((params) => {
          this.loading = true;
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
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recipe', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addRecipe(newRecipe: Recipe): void {
    this.loading = true;

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
          this.loading = false;
          this.router.navigate([`/recipes/${newRecipe.type}/${recipeId}`]);
          this.toastr.info('Recipe added', 'Recipe', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recipe', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  importRecipes(newRecipes: Recipe[]): void {
    this.loading = true;
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
              this.loading = false;
              this.router.navigate(['/recipes/selection']);
              this.toastr.info('Recipes imported', 'Recipe', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom info',
              });
            }
          },
          error: (error: HttpErrorResponse) => {
            completedRequests++;
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Recipe', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    });
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.loading = true;
    this.recipeService
      .updateRecipe(updatedRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([
            `/recipes/${updatedRecipe.type}/${updatedRecipe.id}`,
          ]);
          this.toastr.info('Recipe updated', 'Recipe', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recipe', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}

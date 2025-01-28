import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { AjouterComponent } from './ajouter/ajouter.component';
import { ModifierComponent } from './modifier/modifier.component';
import { combineLatest, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { IngredientService } from '../core/services/ingredient.service';
import { StepService } from '../core/services/step.service';

@Component({
  selector: 'app-editer-recette',
  imports: [CommonModule, RouterModule, AjouterComponent, ModifierComponent],
  templateUrl: './editer-recette.component.html',
  styleUrl: './editer-recette.component.css',
})
export class EditerRecetteComponent implements OnInit, OnDestroy {
  recipeService = inject(RecipeService);
  ingredientService = inject(IngredientService);
  stepService = inject(StepService);
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

          return combineLatest([
            this.recipeService.getRecipe(recipeId),
            this.ingredientService.getIngredients(recipeId),
            this.stepService.getSteps(recipeId),
          ]);
        })
      )
      .subscribe({
        next: ([recipe, ingredients, steps]) => {
          ingredients.sort((a, b) => a.name.localeCompare(b.name));
          steps.sort((a, b) => a.order - b.order);
          this.recipe = { ...recipe, ingredients, steps };
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.toastr.error(error.message, 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom error',
          });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addRecipe(newRecipe: Recipe): void {
    this.recipeService
      .addRecipe(newRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate([`/recettes/${newRecipe.type}/${newRecipe.id}`]);
          this.toastr.info('Recette ajoutée', 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(error.message, 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
      });
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.recipeService
      .updateRecipe(updatedRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate([
            `/recettes/${updatedRecipe.type}/${updatedRecipe.id}`,
          ]);
          this.toastr.info('Recette modifiée', 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(error.message, 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
      });
  }
}

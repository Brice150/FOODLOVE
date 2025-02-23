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
import { ModifierRecetteComponent } from './modifier-recette/modifier-recette.component';
import { AjouterRecetteComponent } from './ajouter-recette/ajouter-recette.component';

@Component({
  selector: 'app-editer-recette',
  imports: [
    CommonModule,
    RouterModule,
    AjouterRecetteComponent,
    ModifierRecetteComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './editer-recette.component.html',
  styleUrl: './editer-recette.component.css',
})
export class EditerRecetteComponent implements OnInit, OnDestroy {
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
            this.toastr.error(error.message, 'Recette', {
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
    let i = 0;
    newRecipe.steps.forEach((step: Step) => {
      step.order = i;
      i++;
    });

    this.recipeService
      .addRecipe(newRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (recipeId: string) => {
          this.loading = false;
          this.router.navigate([`/recettes/${newRecipe.type}/${recipeId}`]);
          this.toastr.info('Recette ajoutée', 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recette', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
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
            `/recettes/${updatedRecipe.type}/${updatedRecipe.id}`,
          ]);
          this.toastr.info('Recette modifiée', 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recette', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}

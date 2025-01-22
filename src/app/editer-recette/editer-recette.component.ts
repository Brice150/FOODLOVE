import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { AjouterComponent } from './ajouter/ajouter.component';
import { ModifierComponent } from './modifier/modifier.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-editer-recette',
  imports: [CommonModule, RouterModule, AjouterComponent, ModifierComponent],
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

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params) => {
        const recipeId = params['id'];
        const recipes = this.recipeService.getRecipes();
        const recipeFound = recipes.find((recipe) => recipe.id === recipeId);

        if (recipeFound) {
          this.recipe = recipeFound;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addRecipe(newRecipe: Recipe): void {
    this.recipeService.addRecipe(newRecipe);
    this.router.navigate([`/recettes/${newRecipe.type}/${newRecipe.id}`]);
    this.toastr.info('Recette ajoutée', 'Recette', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.recipeService.updateRecipe(updatedRecipe);
    this.router.navigate([
      `/recettes/${updatedRecipe.type}/${updatedRecipe.id}`,
    ]);
    this.toastr.info('Recette modifiée', 'Recette', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }
}

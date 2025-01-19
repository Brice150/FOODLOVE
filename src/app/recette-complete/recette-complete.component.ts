import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-recette-complete',
  imports: [CommonModule],
  templateUrl: './recette-complete.component.html',
  styleUrl: './recette-complete.component.css',
})
export class RecetteCompleteComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  recipeService = inject(RecipeService);
  recipe: Recipe = {} as Recipe;
  destroyed$: Subject<void> = new Subject<void>();
  imagePath: string = environment.imagePath;

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
}

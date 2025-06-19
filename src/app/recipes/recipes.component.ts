import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RecipeType } from '../core/enums/recipe-type';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { MenuComponent } from './menu/menu.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipesPerTypeComponent } from './recipes-per-type/recipes-per-type.component';

@Component({
  selector: 'app-recipes',
  imports: [
    CommonModule,
    MenuComponent,
    RecipesPerTypeComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css',
})
export class RecipesComponent implements OnInit, OnDestroy {
  type: string = '';
  route = inject(ActivatedRoute);
  destroyed$ = new Subject<void>();
  RecipeType = RecipeType;
  recipes: Recipe[] = [];
  toastr = inject(ToastrService);
  recipeService = inject(RecipeService);
  starterRecipes: Recipe[] = [];
  mainRecipes: Recipe[] = [];
  dessertRecipes: Recipe[] = [];
  drinkRecipes: Recipe[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.type = params['type'];
      this.recipeService
        .getRecipes()
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (recipes: Recipe[]) => {
            this.recipes = recipes.sort((a, b) => a.name.localeCompare(b.name));
            this.starterRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.STARTER
            );
            this.mainRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.MAIN
            );
            this.dessertRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.DESSERT
            );
            this.drinkRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.DRINK
            );
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RecipeType } from '../core/enums/recipe-type';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { MenuComponent } from './menu/menu.component';
import { RecettesParTypeComponent } from './recettes-par-type/recettes-par-type.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recettes',
  imports: [CommonModule, MenuComponent, RecettesParTypeComponent],
  templateUrl: './recettes.component.html',
  styleUrl: './recettes.component.css',
})
export class RecettesComponent implements OnInit, OnDestroy {
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
              (recipe) => recipe.type === RecipeType.ENTREE
            );
            this.mainRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.PLAT
            );
            this.dessertRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.DESSERT
            );
            this.drinkRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.BOISSON
            );
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Recette', {
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

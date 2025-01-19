import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RecetteComponent } from './recette/recette.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuComponent } from './menu/menu.component';
import { RecipeType } from '../core/enums/recipe-type';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { VideComponent } from './vide/vide.component';

@Component({
  selector: 'app-recettes',
  imports: [CommonModule, RecetteComponent, MenuComponent, VideComponent],
  templateUrl: './recettes.component.html',
  styleUrl: './recettes.component.css',
})
export class RecettesComponent implements OnInit, OnDestroy {
  type: string = '';
  route = inject(ActivatedRoute);
  destroyed$ = new Subject<void>();
  RecipeType = RecipeType;
  recipes: Recipe[] = [];
  recipeService = inject(RecipeService);
  starterRecipes: Recipe[] = [];
  mainRecipes: Recipe[] = [];
  dessertRecipes: Recipe[] = [];
  drinkRecipes: Recipe[] = [];

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.type = params['type'];
      this.recipes = this.recipeService.getRecipes();
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
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

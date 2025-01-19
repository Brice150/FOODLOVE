import { inject, Injectable } from '@angular/core';
import { Recipe } from '../interfaces/recipe';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private recipes: Recipe[] = [];
  userService = inject(UserService);

  getRecipes(): Recipe[] {
    const storedRecipes = this.userService.getUser()?.recipes;
    if (storedRecipes) {
      return storedRecipes;
    }
    return this.recipes;
  }

  addRecipe(recipe: Recipe): void {
    this.recipes = this.getRecipes();
    console.log(recipe);

    this.recipes.push(recipe);
    this.saveRecipes();
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.recipes = this.getRecipes();
    const index = this.recipes.findIndex(
      (recipe) => recipe.id === updatedRecipe.id
    );
    if (index && index !== -1) {
      this.recipes[index] = updatedRecipe;
    }
    this.saveRecipes();
  }

  deleteRecipe(recipeId: string): void {
    this.recipes = this.getRecipes();
    const index = this.recipes.findIndex((recipe) => recipe.id === recipeId);
    if (index !== undefined && index !== -1) {
      this.recipes.splice(index, 1);
    }
    this.saveRecipes();
  }

  private saveRecipes(): void {
    this.userService.saveRecipes(this.recipes);
  }
}

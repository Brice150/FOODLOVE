import { inject, Injectable } from '@angular/core';
import { Recipe } from '../interfaces/recipe';
import { UserService } from './user.service';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private recipes: Recipe[] = [];
  userService = inject(UserService);
  firestore = inject(Firestore);

  getRecipes(): Recipe[] {
    return this.recipes;
  }

  addRecipe(recipe: Recipe): void {
    this.recipes = this.getRecipes();
    this.recipes.push(recipe);
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.recipes = this.getRecipes();
    const index = this.recipes.findIndex(
      (recipe) => recipe.id === updatedRecipe.id
    );
    if (index !== undefined && index !== -1) {
      this.recipes[index] = updatedRecipe;
    }
  }

  deleteRecipe(recipeId: string): void {
    this.recipes = this.getRecipes();
    const index = this.recipes.findIndex((recipe) => recipe.id === recipeId);
    if (index !== undefined && index !== -1) {
      this.recipes.splice(index, 1);
    }
  }
}

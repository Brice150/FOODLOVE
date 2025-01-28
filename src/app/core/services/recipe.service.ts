import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Recipe } from '../interfaces/recipe';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  firestore = inject(Firestore);
  recipesCollection = collection(this.firestore, 'recipes');

  getRecipes(): Observable<Recipe[]> {
    return collectionData(this.recipesCollection, {
      idField: 'id',
    }) as Observable<Recipe[]>;
  }

  getRecipe(recipeId: string): Observable<Recipe> {
    const recipeDoc = doc(this.firestore, `recipes/${recipeId}`);
    return docData(recipeDoc, { idField: 'id' }) as Observable<Recipe>;
  }

  addRecipe(recipe: Recipe): Observable<void> {
    const recipeDoc = doc(this.recipesCollection);
    return from(setDoc(recipeDoc, { ...recipe, id: recipeDoc.id }));
  }

  updateRecipe(recipe: Recipe): Observable<void> {
    if (!recipe.id) {
      return from(Promise.reject('ID de recette manquant.'));
    }
    const recipeDoc = doc(this.firestore, `recipes/${recipe.id}`);
    return from(updateDoc(recipeDoc, { ...recipe }));
  }

  deleteRecipe(recipeId: string): Observable<void> {
    const recipeDoc = doc(this.firestore, `recipes/${recipeId}`);
    return from(deleteDoc(recipeDoc));
  }
}

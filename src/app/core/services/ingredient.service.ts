import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Ingredient } from '../interfaces/ingredient';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  firestore = inject(Firestore);

  getIngredients(recipeId: string): Observable<Ingredient[]> {
    const ingredientsCollection = collection(
      this.firestore,
      `recipes/${recipeId}/ingredients`
    );
    return collectionData(ingredientsCollection, {
      idField: 'id',
    }) as Observable<Ingredient[]>;
  }

  addIngredient(ingredient: Ingredient, recipeId: string): Observable<void> {
    const ingredientDoc = doc(
      this.firestore,
      `recipes/${recipeId}/ingredients`,
      ingredient.id
    );
    return from(setDoc(ingredientDoc, { ...ingredient }));
  }

  updateIngredient(ingredient: Ingredient, recipeId: string): Observable<void> {
    if (!ingredient.id) {
      return from(Promise.reject("ID d'ingrédient manquant."));
    }
    const ingredientDoc = doc(
      this.firestore,
      `recipes/${recipeId}/ingredients`,
      ingredient.id
    );
    return from(updateDoc(ingredientDoc, { ...ingredient }));
  }

  deleteIngredient(ingredientId: string, recipeId: string): Observable<void> {
    const ingredientDoc = doc(
      this.firestore,
      `recipes/${recipeId}/ingredients`,
      ingredientId
    );
    return from(deleteDoc(ingredientDoc));
  }
}

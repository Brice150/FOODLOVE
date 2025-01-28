import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';
import { Recipe } from '../interfaces/recipe';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  recipesCollection = collection(this.firestore, 'recipes');

  getRecipes(): Observable<Recipe[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const recipesCollection = query(
      collection(this.firestore, 'recipes'),
      where('userId', '==', userId)
    );
    return collectionData(recipesCollection, { idField: 'id' }) as Observable<
      Recipe[]
    >;
  }

  getRecipe(recipeId: string): Observable<Recipe> {
    const recipeDoc = doc(this.firestore, `recipes/${recipeId}`);
    return docData(recipeDoc, { idField: 'id' }) as Observable<Recipe>;
  }

  addRecipe(recipe: Recipe): Observable<string> {
    const recipeDoc = doc(this.recipesCollection);
    const recipeId = recipeDoc.id;
    const userId = this.userService.auth.currentUser?.uid;

    return from(
      setDoc(recipeDoc, { ...recipe, id: recipeId, userId: userId })
    ).pipe(map(() => recipeId));
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

  deleteUserRecipes(userId: string): Observable<void> {
    const recipesQuery = query(
      this.recipesCollection,
      where('userId', '==', userId)
    );

    return collectionData(recipesQuery, { idField: 'id' }).pipe(
      switchMap((recipes: any[]) => {
        const recipeData = recipes.map((doc) => doc as Recipe);

        const deleteRequests = recipeData.map((recipe: Recipe) => {
          const recipeDoc = doc(this.firestore, `recipes/${recipe.id}`);
          return deleteDoc(recipeDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}

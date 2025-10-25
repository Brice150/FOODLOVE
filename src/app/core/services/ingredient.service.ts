import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  combineLatest,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Ingredient } from '../interfaces/ingredient';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  ingredientCollection = collection(this.firestore, 'ingredients');

  getIngredients(): Observable<Ingredient[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const ingredientsCollection = query(
      collection(this.firestore, 'ingredients'),
      where('userId', '==', userId)
    );
    return collectionData(ingredientsCollection, {
      idField: 'id',
    }) as Observable<Ingredient[]>;
  }

  addIngredients(ingredients: Ingredient[]): Observable<Ingredient[]> {
    const addRequests = ingredients.map((ingredient) => {
      const ingredientDoc = doc(this.ingredientCollection);
      ingredient.id = ingredientDoc.id;
      ingredient.userId = this.userService.auth.currentUser?.uid;

      return from(setDoc(ingredientDoc, { ...ingredient })).pipe(
        map(() => ingredient)
      );
    });

    return combineLatest(addRequests);
  }

  updateIngredient(ingredient: Ingredient): Observable<void> {
    if (!ingredient.id) {
      return from(Promise.reject("ID d'ingredient manquant."));
    }
    const ingredientDoc = doc(this.firestore, `ingredients/${ingredient.id}`);
    return from(updateDoc(ingredientDoc, { ...ingredient }));
  }

  deleteIngredients(ingredients: Ingredient[]): Observable<void> {
    const deleteRequests = ingredients.map((ingredient: Ingredient) => {
      const ingredientDoc = doc(this.firestore, `ingredients/${ingredient.id}`);
      return deleteDoc(ingredientDoc);
    });

    return combineLatest(deleteRequests).pipe(map(() => undefined));
  }

  deleteUserIngredients(): Observable<void> {
    const ingredientQuery = query(
      this.ingredientCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(ingredientQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((ingredients: any[]) => {
        if (ingredients.length === 0) {
          return of(undefined);
        }

        const deleteRequests = ingredients.map((ingredient: Ingredient) => {
          const ingredientDoc = doc(
            this.firestore,
            `ingredients/${ingredient.id}`
          );
          return deleteDoc(ingredientDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}

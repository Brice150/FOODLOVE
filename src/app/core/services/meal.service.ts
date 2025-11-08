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
import { Meal } from '../interfaces/meal';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class MealService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  mealCollection = collection(this.firestore, 'meals');

  getMeals(): Observable<Meal[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const mealsCollection = query(
      collection(this.firestore, 'meals'),
      where('userId', '==', userId)
    );
    return collectionData(mealsCollection, {
      idField: 'id',
    }) as Observable<Meal[]>;
  }

  editMeals(meals: Meal[]): Observable<Meal[]> {
    const userId = this.userService.auth.currentUser?.uid;

    const requests = meals.map((meal) => {
      const mealDoc = meal.id
        ? doc(this.mealCollection, meal.id)
        : doc(this.mealCollection);

      meal.id = meal.id ?? mealDoc.id;
      meal.userId = userId;

      return from(setDoc(mealDoc, { ...meal }, { merge: true })).pipe(
        map(() => meal)
      );
    });

    return combineLatest(requests);
  }

  updateMeal(meal: Meal): Observable<void> {
    if (!meal.id) {
      return from(Promise.reject('ID du repas manquant.'));
    }
    const mealDoc = doc(this.firestore, `meals/${meal.id}`);
    return from(updateDoc(mealDoc, { ...meal }));
  }

  deleteMeals(meals: Meal[]): Observable<void> {
    const deleteRequests = meals.map((meal: Meal) => {
      const mealDoc = doc(this.firestore, `meals/${meal.id}`);
      return deleteDoc(mealDoc);
    });

    return combineLatest(deleteRequests).pipe(map(() => undefined));
  }

  deleteUserMeals(): Observable<void> {
    const mealQuery = query(
      this.mealCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(mealQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((meals: any[]) => {
        if (meals.length === 0) {
          return of(undefined);
        }

        const deleteRequests = meals.map((meal: Meal) => {
          const mealDoc = doc(this.firestore, `meals/${meal.id}`);
          return deleteDoc(mealDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}

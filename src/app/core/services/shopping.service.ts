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
import { Shopping } from '../interfaces/shopping';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  shoppingCollection = collection(this.firestore, 'shoppings');

  getShoppings(): Observable<Shopping[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const shoppingsCollection = query(
      collection(this.firestore, 'shoppings'),
      where('userId', '==', userId)
    );
    return collectionData(shoppingsCollection, { idField: 'id' }) as Observable<
      Shopping[]
    >;
  }

  addShoppings(shoppings: Shopping[]): Observable<Shopping[]> {
    const addRequests = shoppings.map((shopping) => {
      const shoppingDoc = doc(this.shoppingCollection);
      shopping.id = shoppingDoc.id;
      shopping.userId = this.userService.auth.currentUser?.uid;

      return from(setDoc(shoppingDoc, { ...shopping })).pipe(
        map(() => shopping)
      );
    });

    return combineLatest(addRequests);
  }

  updateShoppings(shoppings: Shopping[]): Observable<void> {
    const updateRequests = shoppings.map((shopping) => {
      if (!shopping.id) {
        return from(Promise.reject('ID de courses manquant.'));
      }
      const shoppingDoc = doc(this.firestore, `shoppings/${shopping.id}`);
      return from(updateDoc(shoppingDoc, { ...shopping }));
    });

    return combineLatest(updateRequests).pipe(map(() => undefined));
  }

  updateShopping(shopping: Shopping): Observable<void> {
    if (!shopping.id) {
      return from(Promise.reject('ID de courses manquant.'));
    }
    const recipeDoc = doc(this.firestore, `shoppings/${shopping.id}`);
    return from(updateDoc(recipeDoc, { ...shopping }));
  }

  deleteShoppings(shoppings: Shopping[]): Observable<void> {
    const deleteRequests = shoppings.map((shopping: Shopping) => {
      const shoppingDoc = doc(this.firestore, `shoppings/${shopping.id}`);
      return deleteDoc(shoppingDoc);
    });

    return combineLatest(deleteRequests).pipe(map(() => undefined));
  }

  deleteUserShopping(): Observable<void> {
    const shoppingQuery = query(
      this.shoppingCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(shoppingQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((shoppings: any[]) => {
        if (shoppings.length === 0) {
          return of(undefined);
        }

        const deleteRequests = shoppings.map((shopping: Shopping) => {
          const shoppingDoc = doc(this.firestore, `shoppings/${shopping.id}`);
          return deleteDoc(shoppingDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}

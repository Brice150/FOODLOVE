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

  addShopping(shopping: Shopping): Observable<string> {
    const shoppingDoc = doc(this.shoppingCollection);
    shopping.id = shoppingDoc.id;
    shopping.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(shoppingDoc, { ...shopping })).pipe(
      map(() => shopping.id)
    );
  }

  updateShopping(shopping: Shopping): Observable<void> {
    if (!shopping.id) {
      return from(Promise.reject('ID de courses manquant.'));
    }
    const recipeDoc = doc(this.firestore, `shoppings/${shopping.id}`);
    return from(updateDoc(recipeDoc, { ...shopping }));
  }

  deleteShopping(shoppingId: string): Observable<void> {
    const shoppingDoc = doc(this.firestore, `shoppings/${shoppingId}`);
    return from(deleteDoc(shoppingDoc));
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

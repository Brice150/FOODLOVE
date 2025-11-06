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
import { Menu } from '../interfaces/menu';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  menuCollection = collection(this.firestore, 'menus');

  getMenus(): Observable<Menu[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const menusCollection = query(
      collection(this.firestore, 'menus'),
      where('userId', '==', userId)
    );
    return collectionData(menusCollection, {
      idField: 'id',
    }) as Observable<Menu[]>;
  }

  addMenus(menus: Menu[]): Observable<Menu[]> {
    const addRequests = menus.map((menu) => {
      const menuDoc = doc(this.menuCollection);
      menu.id = menuDoc.id;
      menu.userId = this.userService.auth.currentUser?.uid;

      return from(setDoc(menuDoc, { ...menu })).pipe(map(() => menu));
    });

    return combineLatest(addRequests);
  }

  updateMenu(menu: Menu): Observable<void> {
    if (!menu.id) {
      return from(Promise.reject('ID du menu manquant.'));
    }
    const menuDoc = doc(this.firestore, `menus/${menu.id}`);
    return from(updateDoc(menuDoc, { ...menu }));
  }

  deleteMenus(menus: Menu[]): Observable<void> {
    const deleteRequests = menus.map((menu: Menu) => {
      const menuDoc = doc(this.firestore, `menus/${menu.id}`);
      return deleteDoc(menuDoc);
    });

    return combineLatest(deleteRequests).pipe(map(() => undefined));
  }

  deleteUserMenus(): Observable<void> {
    const menuQuery = query(
      this.menuCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(menuQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((menus: any[]) => {
        if (menus.length === 0) {
          return of(undefined);
        }

        const deleteRequests = menus.map((menu: Menu) => {
          const menuDoc = doc(this.firestore, `menus/${menu.id}`);
          return deleteDoc(menuDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}

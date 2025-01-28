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
import { Step } from '../interfaces/step';

@Injectable({ providedIn: 'root' })
export class StepService {
  firestore = inject(Firestore);

  getSteps(recipeId: string): Observable<Step[]> {
    const stepsCollection = collection(
      this.firestore,
      `recipes/${recipeId}/steps`
    );
    return collectionData(stepsCollection, { idField: 'id' }) as Observable<
      Step[]
    >;
  }

  addStep(step: Step, recipeId: string): Observable<void> {
    const stepDoc = doc(this.firestore, `recipes/${recipeId}/steps`, step.id);
    return from(setDoc(stepDoc, { ...step }));
  }

  updateStep(step: Step, recipeId: string): Observable<void> {
    if (!step.id) {
      return from(Promise.reject("ID d'étape manquant."));
    }
    const stepDoc = doc(this.firestore, `recipes/${recipeId}/steps`, step.id);
    return from(updateDoc(stepDoc, { ...step }));
  }

  deleteStep(stepId: string, recipeId: string): Observable<void> {
    const stepDoc = doc(this.firestore, `recipes/${recipeId}/steps`, stepId);
    return from(deleteDoc(stepDoc));
  }
}

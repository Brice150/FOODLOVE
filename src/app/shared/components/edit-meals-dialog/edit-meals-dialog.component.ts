import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { DayOfWeek } from '../../../core/enums/day-of-week';
import { Meal } from '../../../core/interfaces/meal';

@Component({
  selector: 'app-edit-meals-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './edit-meals-dialog.component.html',
  styleUrl: './edit-meals-dialog.component.css',
})
export class EditMealsDialogComponent implements OnInit {
  mealsForm!: FormGroup;
  daysOfWeek = Object.values(DayOfWeek);
  fb = inject(FormBuilder);
  oldMeals: Meal[] = [];

  get meals(): FormArray {
    return this.mealsForm.get('meals') as FormArray;
  }

  constructor(
    public dialogRef: MatDialogRef<EditMealsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Meal[]
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.oldMeals = this.data;
    }

    this.mealsForm = this.fb.group({
      meals: this.fb.array([]),
    });

    if (this.oldMeals.length === 0) {
      this.addMeal();
    }

    for (let meal of this.oldMeals) {
      this.addMeal(meal);
    }
  }

  addMeal(meal?: Meal): void {
    this.meals.push(
      this.fb.group({
        id: [meal?.id ?? null],
        order: [meal?.order ?? null],
        name: [
          meal ? meal.name : '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        dayOfWeek: [
          meal ? meal.dayOfWeek : DayOfWeek.MONDAY,
          [Validators.required],
        ],
      })
    );
  }

  removeMeal(index: number): void {
    this.meals.removeAt(index);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.mealsForm.valid) {
      this.dialogRef.close(this.meals.value);
    } else {
      this.mealsForm.markAllAsTouched();
    }
  }
}

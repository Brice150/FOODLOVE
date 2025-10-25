import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { IngredientCategory } from '../../../core/enums/ingredient-category';

@Component({
  selector: 'app-add-ingredients-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './add-ingredients-dialog.component.html',
  styleUrl: './add-ingredients-dialog.component.css',
})
export class AddIngredientsDialogComponent implements OnInit {
  ingredientsForm!: FormGroup;
  IngredientCategory = Object.values(IngredientCategory);
  fb = inject(FormBuilder);

  get ingredients(): FormArray {
    return this.ingredientsForm.get('ingredients') as FormArray;
  }

  constructor(public dialogRef: MatDialogRef<AddIngredientsDialogComponent>) {}

  ngOnInit(): void {
    this.ingredientsForm = this.fb.group({
      ingredients: this.fb.array([]),
    });

    this.addIngredient();
  }

  addIngredient(): void {
    this.ingredients.push(
      this.fb.group({
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        category: [IngredientCategory.OTHER, [Validators.required]],
        quantity: [
          1,
          [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(50),
          ],
        ],
      })
    );
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.ingredientsForm.valid) {
      this.dialogRef.close(this.ingredients.value);
    } else {
      this.ingredientsForm.markAllAsTouched();
    }
  }
}

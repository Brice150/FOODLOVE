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
import { IngredientCategory } from '../../../core/enums/ingredient-category';
import { Ingredient } from '../../../core/interfaces/ingredient';

@Component({
  selector: 'app-ingredient-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './ingredient-dialog.component.html',
  styleUrl: './ingredient-dialog.component.css',
})
export class IngredientDialogComponent implements OnInit {
  ingredientsForm!: FormGroup;
  IngredientCategory = Object.values(IngredientCategory);
  fb = inject(FormBuilder);
  ingredient: Ingredient = {} as Ingredient;

  get ingredients(): FormArray {
    return this.ingredientsForm.get('ingredients') as FormArray;
  }

  constructor(
    public dialogRef: MatDialogRef<IngredientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ingredient
  ) {}

  ngOnInit(): void {
    this.ingredientsForm = this.fb.group({
      ingredients: this.fb.array([]),
    });

    if (this.data) {
      this.ingredient = this.data;
    }

    this.addIngredient();
  }

  addIngredient(): void {
    this.ingredients.push(
      this.fb.group({
        name: [
          this.ingredient.name,
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        category: [this.ingredient.category, [Validators.required]],
        quantity: [
          this.ingredient.quantity,
          [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(50),
          ],
        ],
      })
    );
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.ingredientsForm.valid) {
      this.ingredient.name = this.ingredients.value[0].name;
      this.ingredient.category = this.ingredients.value[0].category;
      this.ingredient.quantity = this.ingredients.value[0].quantity;
      this.dialogRef.close(this.ingredient);
    } else {
      this.ingredientsForm.markAllAsTouched();
    }
  }
}

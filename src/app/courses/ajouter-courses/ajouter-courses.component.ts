import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IngredientCategory } from '../../core/enums/ingredient-category';
import { Ingredient } from '../../core/interfaces/ingredient';
import { Shopping } from '../../core/interfaces/shopping';

@Component({
  selector: 'app-ajouter-courses',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './ajouter-courses.component.html',
  styleUrl: './ajouter-courses.component.css',
})
export class AjouterCoursesComponent implements OnInit {
  groceryForm!: FormGroup;
  fb = inject(FormBuilder);
  IngredientCategory = Object.values(IngredientCategory);
  @Output() submitFormEvent: EventEmitter<Shopping[]> = new EventEmitter<
    Shopping[]
  >();

  get ingredients(): FormArray {
    return this.groceryForm.get('ingredients') as FormArray;
  }

  ngOnInit(): void {
    this.groceryForm = this.fb.group({
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
        category: [IngredientCategory.AUTRES, [Validators.required]],
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

  submitForm(): void {
    if (this.groceryForm.valid) {
      const categorizedIngredients: Record<IngredientCategory, Ingredient[]> =
        {} as Record<IngredientCategory, Ingredient[]>;

      for (const ingredient of this.ingredients.value) {
        const category = ingredient.category as IngredientCategory;
        if (!categorizedIngredients[category]) {
          categorizedIngredients[category] = [];
        }
        categorizedIngredients[category].push(ingredient);
      }

      const shoppings: Shopping[] = Object.entries(categorizedIngredients).map(
        ([category, ingredients]) => {
          ingredients.sort((a, b) => a.name.localeCompare(b.name));
          ingredients.forEach((ingredient) => (ingredient.checked = false));

          return {
            category: category as IngredientCategory,
            ingredients,
          };
        }
      );

      this.submitFormEvent.emit(shoppings);
    } else {
      this.groceryForm.markAllAsTouched();
    }
  }
}

import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shopping-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './shopping-form.component.html',
  styleUrl: './shopping-form.component.css',
})
export class ShoppingFormComponent implements OnInit {
  groceryForm!: FormGroup;
  fb = inject(FormBuilder);
  IngredientCategory = Object.values(IngredientCategory);
  @Input() shoppings: Shopping[] = [];
  @Output() submitFormEvent: EventEmitter<Shopping[]> = new EventEmitter<
    Shopping[]
  >();

  get ingredients(): FormArray {
    return this.groceryForm.get('ingredients') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.groceryForm = this.fb.group({
      ingredients: this.fb.array([]),
    });

    if (this.shoppings.length === 0) {
      this.addIngredient();
    } else {
      for (const shopping of this.shoppings) {
        this.addIngredient(shopping.ingredients);
      }
    }
  }

  addIngredient(ingredients?: Ingredient[]): void {
    if (ingredients && ingredients.length !== 0) {
      for (const ingredient of ingredients) {
        this.ingredients.push(
          this.fb.group({
            name: [
              ingredient.name,
              [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
              ],
            ],
            category: [ingredient.category, [Validators.required]],
            quantity: [
              ingredient.quantity,
              [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(50),
              ],
            ],
          })
        );
      }
    } else {
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

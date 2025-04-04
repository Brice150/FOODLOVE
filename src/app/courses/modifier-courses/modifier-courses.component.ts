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
import { IngredientUnity } from '../../core/enums/ingredient-unity';
import { Shopping } from '../../core/interfaces/shopping';
import { Ingredient } from '../../core/interfaces/ingredient';

@Component({
  selector: 'app-modifier-courses',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './modifier-courses.component.html',
  styleUrl: './modifier-courses.component.css',
})
export class ModifierCoursesComponent implements OnInit {
  groceryForm!: FormGroup;
  fb = inject(FormBuilder);
  @Input() shopping: Shopping = {} as Shopping;
  @Output() submitFormEvent: EventEmitter<Shopping> =
    new EventEmitter<Shopping>();

  get customIngredients(): FormArray {
    return this.groceryForm.get('customIngredients') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.groceryForm = this.fb.group({
      customIngredients: this.fb.array([]),
    });
    this.addIngredient(this.shopping.ingredients);
  }

  addIngredient(ingredients?: Ingredient[]): void {
    if (ingredients && ingredients.length !== 0) {
      for (const ingredient of ingredients) {
        this.customIngredients.push(
          this.fb.group({
            name: [
              ingredient.name,
              [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
              ],
            ],
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
      this.customIngredients.push(
        this.fb.group({
          name: [
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(50),
            ],
          ],
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
    this.customIngredients.removeAt(index);
  }

  submitForm(): void {
    if (this.groceryForm.valid) {
      this.shopping = {} as Shopping;
      this.shopping.ingredients = [];
      for (const customIngredient of this.customIngredients.value) {
        this.shopping.ingredients.push(customIngredient);
      }
      this.shopping.ingredients.sort((a, b) => a.name.localeCompare(b.name));
      this.shopping.ingredients.forEach((ingredient) => {
        ingredient.checked = false;
      });
      this.submitFormEvent.emit(this.shopping);
    } else {
      this.groceryForm.markAllAsTouched();
    }
  }
}

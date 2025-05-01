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
import { Shopping } from '../../core/interfaces/shopping';
import { IngredientCategory } from '../../core/enums/ingredient-category';

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
  @Input() shopping: Shopping = {} as Shopping;
  @Output() submitFormEvent: EventEmitter<Shopping> =
    new EventEmitter<Shopping>();

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
      if (!this.shopping || !this.shopping.ingredients) {
        this.shopping = {} as Shopping;
        this.shopping.ingredients = [];
      }
      for (const ingredient of this.ingredients.value) {
        this.shopping.ingredients.push(ingredient);
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

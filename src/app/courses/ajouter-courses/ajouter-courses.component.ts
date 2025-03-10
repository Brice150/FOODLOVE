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
import { RecipeType } from '../../core/enums/recipe-type';
import { Recipe } from '../../core/interfaces/recipe';
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
  recipeTypes: string[] = [];
  recipesByType: { [key: string]: Recipe[] } = {};
  IngredientUnity = Object.values(IngredientUnity);
  selectedRecipes: Recipe[] = [];
  @Input() recipes: Recipe[] = [];
  @Input() shopping: Shopping = {} as Shopping;
  @Output() submitFormEvent: EventEmitter<void> = new EventEmitter<void>();

  get customIngredients(): FormArray {
    return this.groceryForm.get('customIngredients') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.recipeTypes = Object.values(RecipeType).filter(
      (type) =>
        type !== RecipeType.SELECTION &&
        this.recipes.some((recipe) => recipe.type === type)
    );

    this.recipesByType = this.recipes.reduce((acc, recipe) => {
      (acc[recipe.type] = acc[recipe.type] || []).push(recipe);
      return acc;
    }, {} as { [key: string]: Recipe[] });

    this.groceryForm = this.fb.group({
      recipes: [],
      customIngredients: this.fb.array([]),
    });
    this.addIngredient();
  }

  setIngredients(): void {
    this.selectedRecipes = this.groceryForm.get('recipes')?.value || [];
    const normalizedRecipes = Array.isArray(this.selectedRecipes)
      ? this.selectedRecipes
      : [this.selectedRecipes];

    this.shopping.ingredients = normalizedRecipes
      .flatMap((recipe) => recipe.ingredients || [])
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  addIngredient(): void {
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
          [Validators.required, Validators.min(0.5), Validators.max(999)],
        ],
        unity: [IngredientUnity.UNITE, Validators.required],
      })
    );
  }

  removeIngredient(index: number): void {
    this.customIngredients.removeAt(index);
  }

  submitForm(): void {
    if (this.groceryForm.valid) {
      if (!this.shopping || !this.shopping.ingredients) {
        this.shopping = {} as Shopping;
        this.shopping.ingredients = [];
      }
      for (const customIngredient of this.customIngredients.value) {
        this.shopping.ingredients.push(customIngredient);
      }
      this.shopping.ingredients.sort((a, b) => a.name.localeCompare(b.name));
      this.shopping.ingredients.forEach((ingredient) => {
        ingredient.checked = false;
      });
      this.submitFormEvent.emit();
    } else {
      this.groceryForm.markAllAsTouched();
    }
  }
}

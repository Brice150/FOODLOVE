import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
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
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { IngredientCategory } from '../../../../core/enums/ingredient-category';
import { RecipeType } from '../../../../core/enums/recipe-type';
import { Ingredient } from '../../../../core/interfaces/ingredient';
import { Recipe } from '../../../../core/interfaces/recipe';
import { Step } from '../../../../core/interfaces/step';

@Component({
  selector: 'app-recipe-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatSliderModule,
    MatSelectModule,
    TranslateModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css',
})
export class RecipeFormComponent implements OnInit {
  toastr = inject(ToastrService);
  recipeForm!: FormGroup;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fb = inject(FormBuilder);
  translateService = inject(TranslateService);
  imagePreview: string | null = null;
  IngredientCategory = Object.values(IngredientCategory);
  readonly recipe = input.required<Recipe>();
  @Output() validateRecipeEvent = new EventEmitter<Recipe>();

  get ingredients(): FormArray {
    return this.secondFormGroup.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.thirdFormGroup.get('steps') as FormArray;
  }

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      name: [
        this.recipe().name,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      partNumber: [this.recipe().partNumber, []],
      type: [
        this.recipe().type ? this.recipe().type : RecipeType.MAIN,
        [Validators.required],
      ],
      duration: [this.recipe().duration, []],
    });

    this.secondFormGroup = this.fb.group({
      ingredients: this.fb.array([]),
    });

    this.thirdFormGroup = this.fb.group({
      steps: this.fb.array([]),
    });

    this.recipeForm = this.fb.group({
      firstFormGroup: this.firstFormGroup,
      secondFormGroup: this.secondFormGroup,
      thirdFormGroup: this.thirdFormGroup,
    });

    this.imagePreview = this.recipe().picture;

    this.addIngredient(this.recipe().ingredients);
    this.addStep(this.recipe().steps);
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

  addStep(steps?: Step[]): void {
    if (steps && steps.length !== 0) {
      for (const step of steps) {
        this.steps.push(
          this.fb.group({
            description: [
              step.description,
              [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(999),
              ],
            ],
          })
        );
      }
    } else {
      this.steps.push(
        this.fb.group({
          description: [
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(999),
            ],
          ],
        })
      );
    }
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  addPicture(files: File[]): void {
    for (let file of files) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxDimension = 1200;
          const width = img.width;
          const height = img.height;
          let newWidth, newHeight;

          if (width > height) {
            newWidth = Math.min(width, maxDimension);
            newHeight = (height / width) * newWidth;
          } else {
            newHeight = Math.min(height, maxDimension);
            newWidth = (width / height) * newHeight;
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx!.drawImage(img, 0, 0, newWidth, newHeight);
          let quality = 0.7;
          let dataURL = canvas.toDataURL('image/jpeg', quality);

          this.imagePreview = dataURL;

          this.toastr.info(
            this.translateService.instant('toastr.image'),
            this.translateService.instant('form.recipe'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        };
      };
    }
  }

  addUpdateRecipe(): void {
    if (this.recipe().id) {
      this.updateRecipe();
    } else {
      this.addRecipe();
    }
  }

  updateRecipe(): void {
    if (this.recipeForm.valid) {
      const updatedRecipe: Recipe = {
        id: this.recipe().id,
        name: this.recipeForm.get('firstFormGroup.name')?.value,
        partNumber: this.recipeForm.get('firstFormGroup.partNumber')?.value,
        type: this.recipeForm.get('firstFormGroup.type')?.value,
        duration: this.recipeForm.get('firstFormGroup.duration')?.value,
        picture: this.imagePreview,
        ingredients: this.ingredients.value,
        steps: this.steps.value,
      };
      this.validateRecipeEvent.emit(updatedRecipe);
    } else {
      this.thirdFormGroup.markAllAsTouched();
    }
  }

  addRecipe(): void {
    if (this.recipeForm.valid) {
      const newRecipe: Recipe = {
        id: '',
        name: this.recipeForm.get('firstFormGroup.name')?.value,
        partNumber: this.recipeForm.get('firstFormGroup.partNumber')?.value,
        type: this.recipeForm.get('firstFormGroup.type')?.value,
        duration: this.recipeForm.get('firstFormGroup.duration')?.value,
        picture: this.imagePreview,
        ingredients: this.ingredients.value,
        steps: this.steps.value,
      };

      if (!newRecipe.partNumber) {
        newRecipe.partNumber = 1;
      }

      if (!newRecipe.duration) {
        newRecipe.duration = 5;
      }

      this.validateRecipeEvent.emit(newRecipe);
    } else {
      this.thirdFormGroup.markAllAsTouched();
    }
  }
}

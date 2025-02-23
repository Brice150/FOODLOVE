import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IngredientUnity } from '../core/enums/ingredient-unity';
import { RecipeType } from '../core/enums/recipe-type';
import { Recipe } from '../core/interfaces/recipe';
import { Shopping } from '../core/interfaces/shopping';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';
import { ShoppingService } from '../core/services/shopping.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit, OnDestroy {
  groceryForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  recipeService = inject(RecipeService);
  shoppingService = inject(ShoppingService);
  dialog = inject(MatDialog);
  recipes: Recipe[] = [];
  recipeTypes: string[] = [];
  recipesByType: { [key: string]: Recipe[] } = {};
  pdfGeneratorService = inject(PdfGeneratorService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  formSubmitted: boolean = false;
  IngredientUnity = Object.values(IngredientUnity);
  shopping: Shopping = {} as Shopping;

  get customIngredients(): FormArray {
    return this.groceryForm.get('customIngredients') as FormArray;
  }

  ngOnInit(): void {
    this.shoppingService
      .getShoppings()
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((shoppings: Shopping[]) => {
          if (shoppings[0]?.ingredients?.length > 0) {
            this.shopping = shoppings[0];
            this.shopping.ingredients.sort((a, b) =>
              a.name.localeCompare(b.name)
            );
            this.formSubmitted = true;
            this.loading = false;
            return of(null);
          } else {
            return this.recipeService.getRecipes();
          }
        })
      )
      .subscribe({
        next: (recipes: Recipe[] | null) => {
          this.initForm(recipes);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initForm(recipes: Recipe[] | null): void {
    if (recipes) {
      this.recipes = recipes.sort((a, b) => a.name.localeCompare(b.name));
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
    this.loading = false;
  }

  setIngredients(): void {
    const selectedRecipes = this.groceryForm.get('recipes')?.value || [];
    const normalizedRecipes = Array.isArray(selectedRecipes)
      ? selectedRecipes
      : [selectedRecipes];

    this.shopping.ingredients = normalizedRecipes
      .flatMap((recipe) => recipe.ingredients || [])
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF('to-download', 'Ingrédients.pdf');
    this.toastr.info('Courses téléchargées', 'Courses', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
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
        unity: [IngredientUnity.GRAMME, Validators.required],
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
      const shopping: Shopping = {} as Shopping;
      shopping.ingredients = this.shopping.ingredients;
      this.loading = true;
      this.shoppingService
        .addShopping(shopping)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.formSubmitted = true;
            this.toastr.info('Liste de courses prête', 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Courses', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.groceryForm.markAllAsTouched();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'supprimer la liste de courses',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.shoppingService.deleteShopping(this.shopping.id);
        }),
        switchMap(() => this.recipeService.getRecipes()),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (recipes: Recipe[]) => {
          this.shopping = {} as Shopping;
          this.shopping.ingredients = [];
          this.initForm(recipes);
          this.formSubmitted = false;
          this.loading = false;
          this.toastr.info('Liste de courses supprimée', 'Courses', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}

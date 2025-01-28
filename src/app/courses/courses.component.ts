import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { RecipeType } from '../core/enums/recipe-type';
import { Ingredient } from '../core/interfaces/ingredient';
import { Recipe } from '../core/interfaces/recipe';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit, OnDestroy {
  groceryForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  recipeService = inject(RecipeService);
  recipes: Recipe[] = [];
  recipeTypes: string[] = [];
  recipesByType: { [key: string]: Recipe[] } = {};
  ingredients: Ingredient[] = [];
  pdfGeneratorService = inject(PdfGeneratorService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;

  ngOnInit(): void {
    this.recipeService
      .getRecipes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (recipes: Recipe[]) => {
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
            recipes: [
              this.recipes.length > 0 ? '' : 'empty',
              [Validators.required],
            ],
          });
          this.loading = false;
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

  setIngredients(): void {
    const selectedRecipes = this.groceryForm.get('recipes')?.value || [];
    const normalizedRecipes = Array.isArray(selectedRecipes)
      ? selectedRecipes
      : [selectedRecipes];

    this.ingredients = normalizedRecipes
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
}

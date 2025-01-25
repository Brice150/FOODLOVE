import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { RecipeService } from '../core/services/recipe.service';
import { Recipe } from '../core/interfaces/recipe';
import { MatSelectModule } from '@angular/material/select';
import { RecipeType } from '../core/enums/recipe-type';
import { Ingredient } from '../core/interfaces/ingredient';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';

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
export class CoursesComponent implements OnInit {
  groceryForm!: FormGroup;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  recipeService = inject(RecipeService);
  recipes: Recipe[] = [];
  recipeTypes: string[] = [];
  recipesByType: { [key: string]: Recipe[] } = {};
  ingredients: Ingredient[] = [];
  pdfGeneratorService = inject(PdfGeneratorService);

  ngOnInit(): void {
    this.recipes = this.recipeService
      .getRecipes()
      .sort((a, b) => a.name.localeCompare(b.name));

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
      recipes: [this.recipes.length > 0 ? '' : 'empty', [Validators.required]],
    });
  }

  setIngredients(): void {
    const selectedRecipes: Recipe[] =
      this.groceryForm.get('recipes')?.value || [];

    this.ingredients = selectedRecipes
      .flatMap((recipe) => recipe.ingredients || [])
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF('to-download', 'Ingrédients.pdf');
    this.toastr.info('Recette téléchargée', 'Recette', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }
}

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  combineLatest,
  filter,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { Ingredient } from '../core/interfaces/ingredient';
import { Recipe } from '../core/interfaces/recipe';
import { Step } from '../core/interfaces/step';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { StrikeThroughDirective } from '../shopping/shopping-list/strike-through.directive';
import { IngredientCategory } from '../core/enums/ingredient-category';
import { Shopping } from '../core/interfaces/shopping';
import { ShoppingService } from '../core/services/shopping.service';

@Component({
  selector: 'app-recipe',
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    StrikeThroughDirective,
    MatCheckboxModule,
  ],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.css',
})
export class RecipeComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  recipeService = inject(RecipeService);
  recipe: Recipe = {} as Recipe;
  destroyed$ = new Subject<void>();
  imagePath: string = environment.imagePath;
  dialog = inject(MatDialog);
  router = inject(Router);
  toastr = inject(ToastrService);
  pdfGeneratorService = inject(PdfGeneratorService);
  shoppingService = inject(ShoppingService);
  loading: boolean = true;

  ngOnInit(): void {
    this.recipe.name = 'Recette';
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const recipeId = params['id'];
          return this.recipeService.getRecipe(recipeId);
        }),
        take(1)
      )
      .subscribe({
        next: (recipe) => {
          if (recipe.ingredients.length > 0) {
            recipe.ingredients.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (recipe.steps.length > 0) {
            recipe.steps?.sort((a, b) => a.order - b.order);
          }
          this.recipe = recipe;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recipe', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          } else {
            this.router.navigate(['/recipes/selection']);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this recipe',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.recipeService.deleteRecipe(this.recipe.id);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([`/recipes/${this.recipe.type}`]);
          this.toastr.info('Recipe deleted', 'Recipe', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Recipe', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF(
      'to-download',
      this.recipe.name + '.pdf'
    );
    this.toastr.info('Recipe downloaded', 'Recipe', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  export(): void {
    const { id, userId, ...exportedRecipe } = this.recipe;
    const blob = new Blob([JSON.stringify(exportedRecipe, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportedRecipe.name}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.toastr.info('Recipe exported', 'Recipe', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  toggleChecked(element: Ingredient | Step): void {
    element.checked = !element.checked;
  }

  toggleCheckAll(): void {
    if (this.isAllTicked()) {
      this.recipe.ingredients.forEach((ingredient) => {
        ingredient.checked = false;
      });
      return;
    }
    this.recipe.ingredients.forEach((ingredient) => {
      ingredient.checked = true;
    });
  }

  isAllTicked(): boolean {
    return this.recipe.ingredients.every((ingredient) => ingredient.checked);
  }

  addToShoppingList(): void {
    const ingredientsToAdd = this.recipe.ingredients.filter(
      (ingredient) => ingredient.checked
    );

    if (ingredientsToAdd.length === 0) {
      this.showError('You must check at least one ingredient', 'Recipe');
      return;
    }

    this.loading = true;

    const categorizedIngredients = this.groupByCategory(ingredientsToAdd);

    const newShoppings: Shopping[] = Object.entries(categorizedIngredients).map(
      ([category, ingredients]) => ({
        category: category as IngredientCategory,
        ingredients: ingredients
          .map((ingredient) => ({ ...ingredient, checked: false }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      })
    );

    this.shoppingService
      .getShoppings()
      .pipe(takeUntil(this.destroyed$), take(1))
      .subscribe({
        next: (shoppings) =>
          shoppings?.length
            ? this.updateShoppings(shoppings, newShoppings)
            : this.addShoppings(newShoppings),
        error: (error) => this.handleServiceError(error),
      });
  }

  updateShoppings(
    existingShoppings: Shopping[],
    newShoppings: Shopping[]
  ): void {
    const shoppingMap = this.createShoppingMap(existingShoppings);
    const remainingNewShoppings: Shopping[] = [];

    newShoppings.forEach((newShopping) => {
      const existingShopping = shoppingMap.get(newShopping.category);

      if (existingShopping) {
        this.mergeIngredients(
          existingShopping.ingredients,
          newShopping.ingredients
        );
      } else {
        remainingNewShoppings.push(newShopping);
      }
    });

    const shoppingsToUpdate = Array.from(shoppingMap.values());
    this.syncShoppings(shoppingsToUpdate, remainingNewShoppings);
  }

  addShoppings(newShoppings: Shopping[]): void {
    this.shoppingService
      .addShoppings(newShoppings)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => this.onShoppingSyncSuccess(),
        error: (error) => this.handleServiceError(error),
      });
  }

  groupByCategory(ingredients: Ingredient[]): Record<string, Ingredient[]> {
    return ingredients.reduce((acc, ingredient) => {
      const category = ingredient.category as string;
      acc[category] = acc[category] || [];
      acc[category].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);
  }

  createShoppingMap(shoppings: Shopping[]): Map<string, Shopping> {
    return new Map(
      shoppings.map((shopping) => [
        shopping.category,
        { ...shopping, ingredients: [...shopping.ingredients] },
      ])
    );
  }

  mergeIngredients(
    existingIngredients: Ingredient[],
    newIngredients: Ingredient[]
  ): void {
    newIngredients.forEach((newIngredient) => {
      const existingIngredient = existingIngredients.find(
        (i) => i.name === newIngredient.name
      );

      if (existingIngredient) {
        existingIngredient.quantity = this.mergeQuantities(
          existingIngredient.quantity,
          newIngredient.quantity
        );
      } else {
        existingIngredients.push(newIngredient);
      }
    });
  }

  mergeQuantities(
    existingQuantity: string | undefined,
    newQuantity: string | undefined
  ): string {
    if (!existingQuantity) return newQuantity || '';
    if (!newQuantity) return existingQuantity;

    return `${existingQuantity.trim()} + ${newQuantity.trim()}`;
  }

  syncShoppings(shoppingsToUpdate: Shopping[], newShoppings: Shopping[]): void {
    const addObs =
      newShoppings.length > 0
        ? this.shoppingService.addShoppings(newShoppings)
        : of([]);
    const updateObs =
      shoppingsToUpdate.length > 0
        ? this.shoppingService.updateShoppings(shoppingsToUpdate)
        : of(undefined);

    combineLatest([addObs, updateObs]).subscribe({
      next: () => this.onShoppingSyncSuccess(),
      error: (error) => this.handleServiceError(error),
    });
  }

  onShoppingSyncSuccess(): void {
    this.loading = false;
    this.router.navigate(['/shopping']);
    this.toastr.info('Shopping list ready', 'Shopping', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  showError(message: string, title: string): void {
    this.toastr.error(message, title, {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom error',
    });
  }

  handleServiceError(error: HttpErrorResponse): void {
    this.loading = false;
    if (!error.message.includes('Missing or insufficient permissions.')) {
      this.showError(error.message, 'Shopping');
    }
  }
}

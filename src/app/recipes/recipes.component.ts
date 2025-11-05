import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { RecipeType } from '../core/enums/recipe-type';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { AiDialogComponent } from '../shared/components/ai-dialog/ai-dialog.component';
import { ConfirmationAiDialogComponent } from '../shared/components/confirmation-ai-dialog/confirmation-ai-dialog.component';
import { EditRecipeDialogComponent } from '../shared/components/edit-recipe-dialog/edit-recipe-dialog.component';
import { RecipesPerTypeComponent } from './recipes-per-type/recipes-per-type.component';
import { SelectionComponent } from './selection/selection.component';

@Component({
  selector: 'app-recipes',
  imports: [
    CommonModule,
    SelectionComponent,
    RecipesPerTypeComponent,
    MatProgressSpinnerModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css',
})
export class RecipesComponent implements OnInit, OnDestroy {
  type: string = '';
  route = inject(ActivatedRoute);
  destroyed$ = new Subject<void>();
  RecipeType = RecipeType;
  recipes: Recipe[] = [];
  toastr = inject(ToastrService);
  recipeService = inject(RecipeService);
  translateService = inject(TranslateService);
  starterRecipes: Recipe[] = [];
  mainRecipes: Recipe[] = [];
  dessertRecipes: Recipe[] = [];
  drinkRecipes: Recipe[] = [];
  loading: boolean = true;
  dialog = inject(MatDialog);
  router = inject(Router);

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      this.type = params['type'];
      this.recipeService
        .getRecipes()
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (recipes: Recipe[]) => {
            this.recipes = recipes.sort((a, b) => a.name.localeCompare(b.name));
            this.starterRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.STARTER
            );
            this.mainRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.MAIN
            );
            this.dessertRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.DESSERT
            );
            this.drinkRecipes = this.recipes.filter(
              (recipe) => recipe.type === RecipeType.DRINK
            );
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(
                error.message,
                this.translateService.instant('form.recipe'),
                {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom error',
                }
              );
            }
          },
        });
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addRecipe(type: string): void {
    const choiceDialogRef = this.dialog.open(ConfirmationAiDialogComponent);

    choiceDialogRef
      .afterClosed()
      .pipe(
        filter((res: string) => !!res),
        switchMap((res: string) => {
          let dialogRef;

          if (res === 'ai') {
            dialogRef = this.dialog.open(AiDialogComponent);
          } else if (res === 'me') {
            dialogRef = this.dialog.open(EditRecipeDialogComponent, {
              data: { type },
            });
          } else {
            return of(null);
          }

          return dialogRef.afterClosed();
        }),
        filter((recipe: Recipe | null) => !!recipe),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (recipe: Recipe) => {
          this.router.navigate([`/recipes/${recipe.type}/${recipe.id}`]);

          this.toastr.success(
            this.translateService.instant('toastr.recipe.created'),
            this.translateService.instant('form.recipe'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom success',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(
            error.message,
            this.translateService.instant('form.recipe'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            }
          );
        },
      });
  }
}

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
import { Step } from '../core/interfaces/step';
import { RecipeService } from '../core/services/recipe.service';
import { AiDialogComponent } from '../shared/components/ai-dialog/ai-dialog.component';
import { ConfirmationAiDialogComponent } from '../shared/components/confirmation-ai-dialog/confirmation-ai-dialog.component';
import { EditRecipeDialogComponent } from '../shared/components/edit-recipe-dialog/edit-recipe-dialog.component';
import { RecipesPerTypeComponent } from './recipes-per-type/recipes-per-type.component';
import { SelectionComponent } from './selection/selection.component';
import { Ai } from '../core/interfaces/ai';
import { promptPrefix } from '../../assets/data/prompt-prefix';
import { AiService } from '../core/services/ai.service';

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
  language?: string;
  aiService = inject(AiService);

  ngOnInit(): void {
    if (!this.language) {
      this.language = this.translateService.getBrowserLang() || 'en';
    }

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

  openDialogs(type: string): void {
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

  askAi(ai: Ai): void {
    this.loading = true;

    const prompt = promptPrefix
      .replace('[recipeName]', ai.name || '')
      .replace('[criteria]', ai.other || '')
      .replace('[language]', this.language!);

    this.aiService.generate(prompt).subscribe({
      next: (text) => {
        try {
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonString = jsonMatch ? jsonMatch[1] : text;
          const responseJson = JSON.parse(jsonString);
          const recipe = this.mapToRecipe(responseJson);

          this.addRecipe(recipe);
        } catch (error) {
          this.loading = false;
          this.toastr.error(
            this.translateService.instant('form.error.ai'),
            this.translateService.instant('nav.ai'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            }
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error, this.translateService.instant('nav.ai'), {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom error',
        });
      },
    });
  }

  mapToRecipe(response: any): Recipe {
    return {
      id: '',
      name: response.name,
      type: response.type,
      duration: response.duration,
      partNumber: response.partNumber,
      picture: null,
      ingredients: response.ingredients.map((ing: any) => ({
        name: ing.name,
        quantity: ing.quantity,
        category: ing.category,
      })),
      steps: response.steps.map((step: any) => ({
        description: step.description,
      })),
    };
  }

  addRecipe(newRecipe: Recipe): void {
    this.loading = true;

    if (!newRecipe.partNumber) {
      newRecipe.partNumber = 1;
    }

    if (!newRecipe.duration) {
      newRecipe.duration = 5;
    }

    if (newRecipe.picture === undefined) {
      newRecipe.picture = null;
    }

    newRecipe.steps.forEach((step: Step, i: number) => {
      step.order = i;
    });

    this.recipeService
      .addRecipe(newRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (recipeId: string) => {
          this.loading = false;
          this.router.navigate([`/recipes/${newRecipe.type}/${recipeId}`]);
          this.toastr.info(
            this.translateService.instant('toastr.recipe.added'),
            this.translateService.instant('form.recipe'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
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
  }

  importRecipes(newRecipes: Recipe[]): void {
    this.loading = true;

    let completedRequests = 0;
    newRecipes.forEach((newRecipe) => {
      newRecipe.steps.forEach((step: Step, i: number) => {
        step.order = i;
      });

      this.recipeService
        .addRecipe(newRecipe)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            completedRequests++;

            if (completedRequests === newRecipes.length) {
              this.loading = false;
              this.router.navigate(['/recipes/selection']);
              this.toastr.info(
                this.translateService.instant('toastr.recipe.imported'),
                this.translateService.instant('form.recipe'),
                {
                  positionClass: 'toast-bottom-center',
                  toastClass: 'ngx-toastr custom info',
                }
              );
            }
          },
          error: (error: HttpErrorResponse) => {
            completedRequests++;
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

  updateRecipe(updatedRecipe: Recipe): void {
    this.loading = true;

    this.recipeService
      .updateRecipe(updatedRecipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([
            `/recipes/${updatedRecipe.type}/${updatedRecipe.id}`,
          ]);
          this.toastr.info(
            this.translateService.instant('toastr.recipe.updated'),
            this.translateService.instant('form.recipe'),
            {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
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
  }
}

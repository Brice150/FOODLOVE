import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { promptPrefix } from '../../assets/data/prompt-prefix';
import { Ai } from '../core/interfaces/ai';
import { Recipe } from '../core/interfaces/recipe';
import { Step } from '../core/interfaces/step';
import { AiService } from '../core/services/ai.service';
import { RecipeService } from '../core/services/recipe.service';
import { AiFormComponent } from './ai-form/ai-form.component';

@Component({
  selector: 'app-ai',
  imports: [
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule,
    RouterModule,
    AiFormComponent,
  ],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css',
})
export class AiComponent implements OnInit, OnDestroy {
  aiService = inject(AiService);
  translateService = inject(TranslateService);
  toastr = inject(ToastrService);
  recipeService = inject(RecipeService);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  loading: boolean = false;
  language?: string;

  ngOnInit(): void {
    if (!this.language) {
      this.language = this.translateService.getBrowserLang() || 'en';
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
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

  addRecipe(recipe: Recipe): void {
    if (!recipe.partNumber) {
      recipe.partNumber = 1;
    }

    if (!recipe.duration) {
      recipe.duration = 5;
    }

    recipe.steps.forEach((step: Step, i: number) => {
      step.order = i;
    });

    this.recipeService
      .addRecipe(recipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (recipeId: string) => {
          this.loading = false;
          this.router.navigate([`/recipes/${recipe.type}/${recipeId}`]);
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
}

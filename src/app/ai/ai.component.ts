import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { promptPrefix } from '../../assets/data/prompt-prefix';
import { Recipe } from '../core/interfaces/recipe';
import { Step } from '../core/interfaces/step';
import { AiService } from '../core/services/ai.service';
import { RecipeService } from '../core/services/recipe.service';

@Component({
  selector: 'app-ai',
  imports: [
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
  ],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css',
})
export class AiComponent implements OnInit {
  aiService = inject(AiService);
  translateService = inject(TranslateService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  recipeService = inject(RecipeService);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  aiForm!: FormGroup;
  loading: boolean = false;
  language?: string;

  ngOnInit(): void {
    if (!this.language) {
      this.language = this.translateService.getBrowserLang() || 'en';
    }

    this.aiForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
    });
  }

  askAi(): void {
    const recipeName = this.aiForm.get('name')?.value;

    if (this.aiForm.valid && recipeName) {
      this.loading = true;

      const prompt = promptPrefix
        .replace('[recipeName]', recipeName)
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
    } else {
      this.aiForm.markAllAsTouched();
    }
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

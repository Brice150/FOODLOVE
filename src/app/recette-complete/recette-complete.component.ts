import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, take, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe } from '../core/interfaces/recipe';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { StrikeThroughDirective } from '../courses/consulter-courses/strike-through.directive';
import { Ingredient } from '../core/interfaces/ingredient';
import { Step } from '../core/interfaces/step';

@Component({
  selector: 'app-recette-complete',
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    StrikeThroughDirective,
  ],
  templateUrl: './recette-complete.component.html',
  styleUrl: './recette-complete.component.css',
})
export class RecetteCompleteComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  recipeService = inject(RecipeService);
  recipe: Recipe = {} as Recipe;
  destroyed$ = new Subject<void>();
  imagePath: string = environment.imagePath;
  dialog = inject(MatDialog);
  router = inject(Router);
  toastr = inject(ToastrService);
  pdfGeneratorService = inject(PdfGeneratorService);
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
      data: 'supprimer cette recette',
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

  removeS(unity: string): string {
    return unity.replace('(s)', '');
  }

  removeParentheses(unity: string): string {
    return unity.replace('(', '').replace(')', '');
  }
}

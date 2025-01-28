import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe } from '../core/interfaces/recipe';
import { IngredientService } from '../core/services/ingredient.service';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';
import { StepService } from '../core/services/step.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-recette-complete',
  imports: [CommonModule, RouterModule],
  templateUrl: './recette-complete.component.html',
  styleUrl: './recette-complete.component.css',
})
export class RecetteCompleteComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  recipeService = inject(RecipeService);
  ingredientService = inject(IngredientService);
  stepService = inject(StepService);
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

          return combineLatest([
            this.recipeService.getRecipe(recipeId),
            this.ingredientService.getIngredients(recipeId),
            this.stepService.getSteps(recipeId),
          ]);
        })
      )
      .subscribe({
        next: ([recipe, ingredients, steps]) => {
          ingredients.sort((a, b) => a.name.localeCompare(b.name));
          steps.sort((a, b) => a.order - b.order);
          this.recipe = { ...recipe, ingredients, steps };
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.toastr.error(error.message, 'Recette', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom error',
          });
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
      .pipe(filter((res: boolean) => res))
      .subscribe(() => {
        this.recipeService.deleteRecipe(this.recipe.id);
        this.router.navigate([`/recettes/${this.recipe.type}`]);
        this.toastr.info('Recette supprimée', 'Recette', {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom info',
        });
      });
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF(
      'to-download',
      this.recipe.name + '.pdf'
    );
    this.toastr.info('Recette téléchargée', 'Recette', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }
}

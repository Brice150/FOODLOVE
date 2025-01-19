import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from '../core/interfaces/recipe';
import { RecipeService } from '../core/services/recipe.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recette-complete',
  imports: [CommonModule],
  templateUrl: './recette-complete.component.html',
  styleUrl: './recette-complete.component.css',
})
export class RecetteCompleteComponent implements OnInit, OnDestroy {
  activatedRoute = inject(ActivatedRoute);
  recipeService = inject(RecipeService);
  recipe: Recipe = {} as Recipe;
  destroyed$: Subject<void> = new Subject<void>();
  imagePath: string = environment.imagePath;
  dialog = inject(MatDialog);
  router = inject(Router);
  toastr = inject(ToastrService);

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params) => {
        const recipeId = params['id'];
        const recipes = this.recipeService.getRecipes();
        const recipeFound = recipes.find((recipe) => recipe.id === recipeId);

        if (recipeFound) {
          this.recipe = recipeFound;
        }
      });
  }

  updateRecipe(): void {
    this.toastr.info('Recette modifiée', 'Recette', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

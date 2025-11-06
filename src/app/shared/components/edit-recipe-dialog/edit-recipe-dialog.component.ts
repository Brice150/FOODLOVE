import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Recipe } from '../../../core/interfaces/recipe';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';

@Component({
  selector: 'app-edit-recipe-dialog',
  imports: [
    CommonModule,
    RouterModule,
    RecipeFormComponent,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './edit-recipe-dialog.component.html',
  styleUrl: './edit-recipe-dialog.component.css',
})
export class EditRecipeDialogComponent implements OnInit {
  toastr = inject(ToastrService);
  translateService = inject(TranslateService);
  recipe: Recipe = {} as Recipe;

  constructor(
    public dialogRef: MatDialogRef<EditRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Recipe
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.recipe = this.data;
    }
  }

  validateRecipe(recipe: Recipe): void {
    this.dialogRef.close(recipe);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

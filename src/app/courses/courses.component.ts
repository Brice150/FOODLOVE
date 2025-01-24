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

  ngOnInit(): void {
    this.groceryForm = this.fb.group({
      recipe: ['', [Validators.required]],
    });

    this.recipes = this.recipeService.getRecipes();
  }
}

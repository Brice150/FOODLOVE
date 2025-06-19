import { CommonModule } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { Recipe } from '../../core/interfaces/recipe';
import { EmptyComponent } from './empty/empty.component';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipes-per-type',
  imports: [
    CommonModule,
    EmptyComponent,
    RecipeCardComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './recipes-per-type.component.html',
  styleUrl: './recipes-per-type.component.css',
})
export class RecipesPerTypeComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  fb = inject(FormBuilder);
  readonly recipes = input<Recipe[]>([]);
  filteredRecipes: Recipe[] = [];
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['', []],
    });

    this.filteredRecipes = [...this.recipes()];

    this.searchForm
      .get('search')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((searchValue: string) => {
        this.filteredRecipes = this.filterRecipes(searchValue);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  filterRecipes(searchValue: string): Recipe[] {
    if (!searchValue) {
      return [...this.recipes()];
    }

    return this.recipes().filter((recipe) =>
      recipe.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }
}

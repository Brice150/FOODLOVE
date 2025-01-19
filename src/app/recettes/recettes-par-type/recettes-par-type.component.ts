import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { VideComponent } from './vide/vide.component';
import { RecetteComponent } from './recette/recette.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../../core/interfaces/recipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-recettes-par-type',
  imports: [
    CommonModule,
    VideComponent,
    RecetteComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './recettes-par-type.component.html',
  styleUrl: './recettes-par-type.component.css',
})
export class RecettesParTypeComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  fb = inject(FormBuilder);
  @Input() recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  destroyed$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['', []],
    });

    this.filteredRecipes = [...this.recipes];

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
      return [...this.recipes];
    }

    return this.recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }
}

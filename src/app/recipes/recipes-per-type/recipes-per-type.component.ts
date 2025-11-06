import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
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
  @Output() addRecipeEvent = new EventEmitter<void>();
  @Output() importRecipesEvent = new EventEmitter<Recipe[]>();

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

  addRecipe(): void {
    this.addRecipeEvent.emit();
  }

  importRecipes(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    let newRecipes: Recipe[] = [];

    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const newRecipeImported: Recipe = JSON.parse(reader.result as string);

          const newRecipe: Recipe = {
            id: '',
            name: newRecipeImported.name,
            partNumber: newRecipeImported.partNumber,
            type: newRecipeImported.type,
            duration: newRecipeImported.duration,
            picture: newRecipeImported.picture,
            ingredients: newRecipeImported.ingredients,
            steps: newRecipeImported.steps,
          };
          newRecipes.push(newRecipe);

          if (newRecipes.length === files.length) {
            this.importRecipesEvent.emit(newRecipes);
          }
        };
        reader.readAsText(file);
      });
    }
  }
}

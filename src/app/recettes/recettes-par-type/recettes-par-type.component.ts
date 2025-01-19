import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { VideComponent } from './vide/vide.component';
import { RecetteComponent } from './recette/recette.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../../core/interfaces/recipe';

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
export class RecettesParTypeComponent implements OnInit {
  searchForm!: FormGroup;
  fb = inject(FormBuilder);
  @Input() recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['', []],
    });

    this.filteredRecipes = [...this.recipes];
  }
}

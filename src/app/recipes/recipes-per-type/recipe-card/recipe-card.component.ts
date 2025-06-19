import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../../core/interfaces/recipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recipe-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  readonly recipe = input.required<Recipe>();
  imagePath: string = environment.imagePath;
}

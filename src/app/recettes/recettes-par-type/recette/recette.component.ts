import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../../core/interfaces/recipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recette',
  imports: [CommonModule, RouterModule],
  templateUrl: './recette.component.html',
  styleUrl: './recette.component.css',
})
export class RecetteComponent {
  readonly recipe = input.required<Recipe>();
  imagePath: string = environment.imagePath;
}

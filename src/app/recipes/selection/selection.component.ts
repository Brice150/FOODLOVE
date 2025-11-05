import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { RecipeType } from '../../core/enums/recipe-type';

@Component({
  selector: 'app-selection',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.css',
})
export class SelectionComponent {
  imagePath: string = environment.imagePath;
  RecipeType = RecipeType;
  readonly counts = input<number[]>([0, 0, 0, 0]);
}

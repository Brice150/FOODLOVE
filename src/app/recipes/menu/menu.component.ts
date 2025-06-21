import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RecipeType } from '../../core/enums/recipe-type';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  imagePath: string = environment.imagePath;
  RecipeType = RecipeType;
  readonly counts = input<number[]>([0, 0, 0, 0]);
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RecipeType } from '../../core/enums/recipe-type';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  imagePath: string = environment.imagePath;
  RecipeType = RecipeType;
  @Input() counts: number[] = [0, 0, 0, 0];
}

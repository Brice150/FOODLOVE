import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  imagePath: string = environment.imagePath;
  startersNumber: number = 0;
  mainsNumber: number = 0;
  dessertsNumber: number = 0;
  drinksNumber: number = 0;
}

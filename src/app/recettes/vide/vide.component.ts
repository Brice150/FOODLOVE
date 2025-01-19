import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vide',
  imports: [CommonModule, RouterModule],
  templateUrl: './vide.component.html',
  styleUrl: './vide.component.css',
})
export class VideComponent {
  imagePath: string = environment.imagePath;
}

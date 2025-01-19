import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vide',
  imports: [CommonModule, RouterModule],
  templateUrl: './vide.component.html',
  styleUrl: './vide.component.css',
})
export class VideComponent {
  imagePath: string = environment.imagePath;
}

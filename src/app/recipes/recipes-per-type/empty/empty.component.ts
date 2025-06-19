import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-empty',
  imports: [CommonModule, RouterModule],
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.css',
})
export class EmptyComponent {
  imagePath: string = environment.imagePath;
}

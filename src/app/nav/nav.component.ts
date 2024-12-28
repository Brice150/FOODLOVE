import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../core/interfaces/user';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  imagePath: string = environment.imagePath;
  router = inject(Router);
  readonly user = input.required<User>();
  @Output() openCloseEvent = new EventEmitter<void>();
  @Output() changeModeEvent = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();

  openCloseNav(): void {
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.classList.toggle('close');
      this.openCloseEvent.emit();
    }
  }

  changeMode(): void {
    this.changeModeEvent.emit();
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}

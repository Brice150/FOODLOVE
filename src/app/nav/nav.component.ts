import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Output,
  input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../core/interfaces/user';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  router = inject(Router);
  readonly user = input.required<User>();
  @Output() openCloseEvent = new EventEmitter<void>();
  @Output() changeModeEvent = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();

  ngOnInit(): void {
    const contents = document.querySelector('.contents');
    if (contents && !contents.classList.contains('enable')) {
      contents.classList.add('enable');
    }
  }

  ngOnDestroy(): void {
    const contents = document.querySelector('.contents');
    if (contents) {
      contents.classList.remove('enable');
      contents.classList.remove('open');
    }
  }

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

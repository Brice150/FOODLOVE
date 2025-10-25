import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  router = inject(Router);
  nav?: HTMLElement;
  readonly prefersDarkMode = input.required<boolean>();
  @Output() openCloseEvent = new EventEmitter<void>();
  @Output() changeModeEvent = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.nav = document.querySelector('.nav') as HTMLElement;

    const contents = document.querySelector('.contents');
    if (contents && !contents.classList.contains('enable')) {
      contents.classList.add('enable');
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.nav && !this.nav.classList.contains('close')) {
          if (window.innerWidth <= 426) {
            this.nav.classList.add('close');
            this.openCloseEvent.emit();
          }
        }
      });
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

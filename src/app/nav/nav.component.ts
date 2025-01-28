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
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit, OnDestroy {
  imagePath: string = environment.imagePath;
  router = inject(Router);
  toastr = inject(ToastrService);
  readonly prefersDarkMode = input.required<boolean>();
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
    this.toastr.info('Mode changé', 'Foodlove', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  logout(): void {
    this.logoutEvent.emit();
    this.toastr.info('Déconnecté', 'Foodlove', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }
}

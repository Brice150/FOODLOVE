import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { MenuService } from '../core/services/menu.service';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { Menu } from '../core/interfaces/menu';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  menuService = inject(MenuService);
  pdfGeneratorService = inject(PdfGeneratorService);
  translateService = inject(TranslateService);
  toastr = inject(ToastrService);
  menu: Menu = {} as Menu;

  ngOnInit(): void {
    this.menuService
      .getMenus()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (menus: Menu[]) => {
          if (menus?.length > 0) {
            this.menu = menus[0];
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(
              error.message,
              this.translateService.instant('nav.shopping'),
              {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              }
            );
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

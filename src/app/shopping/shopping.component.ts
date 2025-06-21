import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, debounceTime, of, Subject, takeUntil, tap } from 'rxjs';
import { Shopping } from '../core/interfaces/shopping';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { ShoppingService } from '../core/services/shopping.service';
import { ShoppingFormComponent } from './shopping-form/shopping-form.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shopping',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ShoppingFormComponent,
    ShoppingListComponent,
    TranslateModule,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent implements OnInit, OnDestroy {
  updateMode: boolean = false;
  toastr = inject(ToastrService);
  shoppingService = inject(ShoppingService);
  pdfGeneratorService = inject(PdfGeneratorService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  formSubmitted: boolean = false;
  shoppings: Shopping[] = [];
  updateShopping$ = new Subject<Shopping>();
  updatesPending: boolean = false;

  ngOnInit(): void {
    this.shoppingService
      .getShoppings()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (shoppings: Shopping[]) => {
          if (shoppings?.length > 0) {
            this.shoppings = shoppings.sort((a, b) =>
              a.category.localeCompare(b.category)
            );
            this.shoppings.forEach((shopping) => {
              shopping?.ingredients?.sort((a, b) =>
                a.name.localeCompare(b.name)
              );
            });
            this.formSubmitted = true;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Shopping', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });

    this.updateShopping$
      .pipe(
        tap((shopping: Shopping) => {
          this.updatesPending = true;
          return shopping;
        }),
        debounceTime(1500),
        tap((shopping: Shopping) => {
          if (this.updatesPending) {
            this.updatesPending = false;
            this.updateShopping(shopping);
          }
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  updateShopping(shopping: Shopping): void {
    this.shoppingService
      .updateShopping(shopping)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.shoppings.filter((shopping) => shopping.id === shopping.id)[0] =
            shopping;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Shopping', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  updateShoppings(shoppings: Shopping[]): void {
    this.loading = true;

    const missingShoppings = this.shoppings.filter(
      (existingShopping) =>
        !shoppings.some((newShopping) => newShopping.id === existingShopping.id)
    );

    const newShoppings = shoppings.filter((newShopping) => !newShopping.id);

    const updatedShoppings = shoppings.filter(
      (newShopping) =>
        newShopping.id &&
        this.shoppings.some(
          (existingShopping) => existingShopping.id === newShopping.id
        )
    );

    const deleteObs =
      missingShoppings.length > 0
        ? this.shoppingService.deleteShoppings(missingShoppings)
        : of(undefined);

    const addObs =
      newShoppings.length > 0
        ? this.shoppingService.addShoppings(newShoppings)
        : of([]);

    const updateObs =
      updatedShoppings.length > 0
        ? this.shoppingService.updateShoppings(updatedShoppings)
        : of(undefined);

    combineLatest([deleteObs, addObs, updateObs]).subscribe({
      next: ([, addedShoppings]) => {
        this.shoppings = [
          ...shoppings.filter((shopping) => shopping.id),
          ...addedShoppings,
        ];

        this.loading = false;
        this.formSubmitted = true;
        this.updateMode = false;

        this.toastr.info('Shopping list ready', 'Shopping', {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom info',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        if (!error.message.includes('Missing or insufficient permissions.')) {
          this.toastr.error(error.message, 'Shopping', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom error',
          });
        }
      },
    });
  }

  updateShoppingWithDelay(category: string): void {
    this.updateShopping$.next(
      this.shoppings.filter((shopping) => shopping.category === category)[0]
    );
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF('to-download', 'Ingrédients.pdf');
    this.toastr.info('Shopping list downloaded', 'Shopping', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  deleteShoppings(): void {
    this.loading = true;
    this.shoppingService
      .deleteUserShopping()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.shoppings = [];
          this.formSubmitted = false;
          this.loading = false;
          this.toastr.info('Shopping list deleted', 'Shopping', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Shopping', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  toggleUpdateMode(): void {
    this.formSubmitted = false;
    this.updateMode = true;
  }
}

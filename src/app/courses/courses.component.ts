import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Recipe } from '../core/interfaces/recipe';
import { Shopping } from '../core/interfaces/shopping';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';
import { RecipeService } from '../core/services/recipe.service';
import { ShoppingService } from '../core/services/shopping.service';
import { AjouterCoursesComponent } from './ajouter-courses/ajouter-courses.component';
import { ConsulterCoursesComponent } from './consulter-courses/consulter-courses.component';
import { ModifierCoursesComponent } from './modifier-courses/modifier-courses.component';

@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ModifierCoursesComponent,
    AjouterCoursesComponent,
    ConsulterCoursesComponent,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit, OnDestroy {
  updateMode: boolean = false;
  toastr = inject(ToastrService);
  recipeService = inject(RecipeService);
  shoppingService = inject(ShoppingService);
  recipes: Recipe[] = [];
  pdfGeneratorService = inject(PdfGeneratorService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  formSubmitted: boolean = false;
  shopping: Shopping = {} as Shopping;
  updateShopping$ = new Subject<Shopping>();
  updatesPending: boolean = false;

  ngOnInit(): void {
    this.shoppingService
      .getShoppings()
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((shoppings: Shopping[]) => {
          if (shoppings[0]?.ingredients?.length > 0) {
            this.shopping = shoppings[0];
            this.shopping.ingredients.sort((a, b) =>
              a.name.localeCompare(b.name)
            );
            this.formSubmitted = true;
            this.loading = false;
            return of(null);
          } else {
            return this.recipeService.getRecipes();
          }
        })
      )
      .subscribe({
        next: (recipes: Recipe[] | null) => {
          if (recipes) {
            this.recipes = recipes;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });

    this.updateShopping$
      .pipe(
        tap(() => {
          this.updatesPending = true;
        }),
        debounceTime(1500),
        tap(() => {
          if (this.updatesPending) {
            this.updatesPending = false;
            this.updateShopping(this.shopping, true);
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

  addShopping(): void {
    this.loading = true;
    this.shoppingService
      .addShopping(this.shopping)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.formSubmitted = true;
          this.toastr.info('Liste de courses prête', 'Courses', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  updateShopping(shopping: Shopping, delayMode: boolean): void {
    this.loading = !delayMode;
    this.shopping.ingredients = shopping.ingredients;
    this.shoppingService
      .updateShopping(this.shopping)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          if (!delayMode) {
            this.loading = false;
            this.formSubmitted = true;
            this.updateMode = false;
            this.toastr.info('Liste de courses modifiée', 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Courses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  updateShoppingWithDelay(): void {
    this.updateShopping$.next(this.shopping);
  }

  downloadPDF(): void {
    this.pdfGeneratorService.generatePDF('to-download', 'Ingrédients.pdf');
    this.toastr.info('Courses téléchargées', 'Courses', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }

  deleteShopping(): void {
    this.loading = true;
    this.shoppingService
      .deleteShopping(this.shopping.id)
      .pipe(
        switchMap(() => this.recipeService.getRecipes()),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: (recipes: Recipe[]) => {
          this.shopping = {} as Shopping;
          this.shopping.ingredients = [];
          this.recipes = recipes;
          this.formSubmitted = false;
          this.loading = false;
          this.toastr.info('Liste de courses supprimée', 'Courses', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Courses', {
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

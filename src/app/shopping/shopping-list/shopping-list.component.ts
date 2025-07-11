import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { filter } from 'rxjs';
import { Ingredient } from '../../core/interfaces/ingredient';
import { Shopping } from '../../core/interfaces/shopping';
import { PdfGeneratorService } from '../../core/services/pdf-generator.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { StrikeThroughDirective } from './strike-through.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shopping-list',
  imports: [
    CommonModule,
    MatChipsModule,
    StrikeThroughDirective,
    MatExpansionModule,
    TranslateModule,
  ],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.css',
})
export class ShoppingListComponent {
  dialog = inject(MatDialog);
  pdfGeneratorService = inject(PdfGeneratorService);
  groupedIngredients: { category: string; ingredients: Ingredient[] }[] = [];
  readonly shoppings = input<Shopping[]>([]);
  @Output() deleteEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() updateEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() downloadEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() strikeEvent: EventEmitter<string> = new EventEmitter<string>();

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'actions.delete.shopping-list',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res: boolean) => res))
      .subscribe({
        next: () => {
          this.deleteEvent.emit();
        },
      });
  }

  update(): void {
    this.updateEvent.emit();
  }

  downloadPDF(): void {
    this.downloadEvent.emit();
  }

  toggleChecked(ingredient: Ingredient): void {
    ingredient.checked = !ingredient.checked;
    this.strikeEvent.emit(ingredient.category);
  }
}

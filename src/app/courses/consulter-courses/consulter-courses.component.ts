import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { filter } from 'rxjs';
import { Ingredient } from '../../core/interfaces/ingredient';
import { Shopping } from '../../core/interfaces/shopping';
import { PdfGeneratorService } from '../../core/services/pdf-generator.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { StrikeThroughDirective } from './strike-through.directive';

@Component({
  selector: 'app-consulter-courses',
  imports: [
    CommonModule,
    MatChipsModule,
    StrikeThroughDirective,
    MatExpansionModule,
  ],
  templateUrl: './consulter-courses.component.html',
  styleUrl: './consulter-courses.component.css',
})
export class ConsulterCoursesComponent implements OnInit {
  dialog = inject(MatDialog);
  pdfGeneratorService = inject(PdfGeneratorService);
  groupedIngredients: { category: string; ingredients: Ingredient[] }[] = [];
  @Input() shopping: Shopping = {} as Shopping;
  @Output() deleteEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() updateEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() downloadEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() strikeEvent: EventEmitter<void> = new EventEmitter<void>();

  ngOnInit(): void {
    const categories = Array.from(
      new Set(this.shopping.ingredients.map((ing) => ing.category))
    );
    this.groupedIngredients = categories
      .map((category) => ({
        category,
        ingredients: this.shopping.ingredients.filter(
          (ing) => ing.category === category
        ),
      }))
      .filter((group) => group.ingredients.length > 0);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'supprimer la liste de courses',
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
    this.strikeEvent.emit();
  }
}

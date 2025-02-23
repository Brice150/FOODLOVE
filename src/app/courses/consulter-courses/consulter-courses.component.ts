import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Shopping } from '../../core/interfaces/shopping';
import { filter } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PdfGeneratorService } from '../../core/services/pdf-generator.service';

@Component({
  selector: 'app-consulter-courses',
  imports: [CommonModule],
  templateUrl: './consulter-courses.component.html',
  styleUrl: './consulter-courses.component.css',
})
export class ConsulterCoursesComponent {
  dialog = inject(MatDialog);
  pdfGeneratorService = inject(PdfGeneratorService);
  @Input() shopping: Shopping = {} as Shopping;
  @Output() deleteEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() updateEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() downloadEvent: EventEmitter<void> = new EventEmitter<void>();

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
}

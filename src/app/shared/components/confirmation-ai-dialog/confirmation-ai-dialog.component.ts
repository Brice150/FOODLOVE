import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-ai-dialog',
  imports: [CommonModule, TranslateModule],
  templateUrl: './confirmation-ai-dialog.component.html',
  styleUrl: './confirmation-ai-dialog.component.css',
})
export class ConfirmationAiDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationAiDialogComponent>) {}

  ai(): void {
    this.dialogRef.close('ai');
  }

  me(): void {
    this.dialogRef.close('me');
  }
}

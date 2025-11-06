import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Ai } from '../../../core/interfaces/ai';
import { AiFormComponent } from './ai-form/ai-form.component';

@Component({
  selector: 'app-ai-dialog',
  imports: [CommonModule, TranslateModule, AiFormComponent],
  templateUrl: './ai-dialog.component.html',
  styleUrl: './ai-dialog.component.css',
})
export class AiDialogComponent {
  translateService = inject(TranslateService);
  toastr = inject(ToastrService);

  constructor(public dialogRef: MatDialogRef<AiDialogComponent>) {}

  askAi(ai: Ai): void {
    //TODO
    this.dialogRef.close(ai);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

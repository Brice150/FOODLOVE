import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Ai } from '../../../../core/interfaces/ai';

@Component({
  selector: 'app-ai-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    TranslateModule,
    MatSelectModule,
  ],
  templateUrl: './ai-form.component.html',
  styleUrl: './ai-form.component.css',
})
export class AiFormComponent implements OnInit {
  aiForm!: FormGroup;
  fb = inject(FormBuilder);
  translateService = inject(TranslateService);
  toastr = inject(ToastrService);
  @Output() askAiEvent = new EventEmitter<Ai>();

  ngOnInit(): void {
    this.aiForm = this.fb.group({
      name: ['', []],
      other: ['', []],
    });
  }

  askAi(): void {
    if (
      this.aiForm.valid &&
      (this.aiForm.get('name')?.value || this.aiForm.get('other')?.value)
    ) {
      this.askAiEvent.emit(this.aiForm.value);
    } else {
      this.toastr.error(
        this.translateService.instant('form.error.at-least-one'),
        this.translateService.instant('nav.ai'),
        {
          positionClass: 'toast-bottom-center',
          toastClass: 'ngx-toastr custom error',
        }
      );
    }
  }
}

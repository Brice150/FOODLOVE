import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  input,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-plans',
  imports: [CommonModule, TranslateModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css',
})
export class PlansComponent implements OnInit {
  readonly selectedPlan = input<string>('');
  localSelected = signal<string>('');
  @Output() selectPlanEvent = new EventEmitter<string>();

  ngOnInit(): void {
    this.localSelected.set(this.selectedPlan());
  }

  selectPlan(payType: string): void {
    if (!this.selectedPlan()) {
      this.selectPlanEvent.emit(payType);
    } else {
      this.localSelected.set(payType);
    }
  }
}

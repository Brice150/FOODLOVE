import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { PlansComponent } from '../plans/plans.component';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, TranslateModule, PlansComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit, AfterViewInit {
  imagePath: string = environment.imagePath;
  translateService = inject(TranslateService);
  browserLang?: string;
  @ViewChildren('feature') features!: QueryList<ElementRef>;
  @Output() selectPlanEvent = new EventEmitter<string>();

  ngOnInit(): void {
    this.browserLang = this.translateService.getBrowserLang() || 'en';
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const relativeDelay = index * 0.2;
            element.style.transitionDelay = `${relativeDelay}s`;
            element.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    this.features.forEach((feature) => {
      observer.observe(feature.nativeElement);
    });
  }

  selectPlan(payType: string): void {
    this.selectPlanEvent.emit(payType);
  }
}

import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  OnChanges,
} from '@angular/core';

@Directive({
  selector: '[appStrikeThrough]',
})
export class StrikeThroughDirective implements OnChanges {
  @Input() appStrikeThrough = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    if (this.appStrikeThrough) {
      this.renderer.setStyle(
        this.el.nativeElement,
        'text-decoration',
        'line-through'
      );
      this.renderer.setStyle(
        this.el.nativeElement,
        'text-decoration-color',
        'var(--primary)'
      );
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'text-decoration');
      this.renderer.removeStyle(this.el.nativeElement, 'text-decoration-color');
    }
  }
}

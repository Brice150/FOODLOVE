import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDisableScroll]',
})
export class DisableScrollDirective {
  constructor(private el: ElementRef) {}

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.el.nativeElement.type === 'number') {
      event.preventDefault();
    }
  }
}

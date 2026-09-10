import {Directive, ElementRef, HostListener, inject, output} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef<HTMLElement>);

  appClickOutside = output<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.appClickOutside.emit();
  }
}

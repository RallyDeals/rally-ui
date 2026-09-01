import { Directive, HostListener, input } from '@angular/core';

@Directive({
  selector: 'img[fallbackSrc]',
  standalone: true,
})
export class ImageFallbackDirective {
  fallbackSrc = input('');

  @HostListener('error', ['$event'])
  onError(event: Event) {
    const image = event.target as HTMLImageElement;
    if (image.src !== this.fallbackSrc()) {
      image.src = this.fallbackSrc();
    }
  }
}

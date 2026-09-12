import {ChangeDetectionStrategy, Component, computed, ElementRef, OnInit, input, output, signal, viewChild} from '@angular/core';
import {debounceTime, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-dual-range',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dual-range.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DualRangeComponent implements OnInit {
  min = input(0);
  max = input(100);
  step = input(1);
  initialMinValue = input<number | undefined>(undefined);
  initialMaxValue = input<number | undefined>(undefined);
  minValueChange = output<number | null>();
  maxValueChange = output<number | null>();

  lowerInput = viewChild<ElementRef<HTMLInputElement>>('lowerInput');
  upperInput = viewChild<ElementRef<HTMLInputElement>>('upperInput');

  minValue = signal<number | null>(null);
  maxValue = signal<number | null>(null);

  lowerThumb = computed(() => this.minValue() ?? this.min());
  upperThumb = computed(() => this.maxValue() ?? this.max());

  trackFillStyle = computed(() => {
    const range = this.max() - this.min();
    const lower = ((this.lowerThumb() - this.min()) / range) * 100;
    const upper = ((this.upperThumb() - this.min()) / range) * 100;
    return `background: linear-gradient(to right,` +
      ` rgb(22 24 15 / 0.1) ${lower}%,` +
      ` var(--color-accent) ${lower}%,` +
      ` var(--color-accent) ${upper}%,` +
      ` rgb(22 24 15 / 0.1) ${upper}%)`;
  });

  private minValueDebouncer = new Subject<number | null>();
  private maxValueDebouncer = new Subject<number | null>();

  constructor() {
    this.minValueDebouncer.pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(val => this.minValueChange.emit(val));
    this.maxValueDebouncer.pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(val => this.maxValueChange.emit(val));
  }

  ngOnInit(): void {
    this.minValue.set(this.initialMinValue() ?? null);
    this.maxValue.set(this.initialMaxValue() ?? null);
  }

  onLowerChange(value: string): void {
    const clamped = Math.min(+value, this.upperThumb());
    const next = clamped <= this.min() ? null : clamped;
    this.minValue.set(next);
    const el = this.lowerInput()?.nativeElement;
    if (el) el.value = String(this.lowerThumb());
    this.minValueDebouncer.next(next);
  }

  onUpperChange(value: string): void {
    const clamped = Math.max(+value, this.lowerThumb());
    const next = clamped >= this.max() ? null : clamped;
    this.maxValue.set(next);
    const el = this.upperInput()?.nativeElement;
    if (el) el.value = String(this.upperThumb());
    this.maxValueDebouncer.next(next);
  }
}

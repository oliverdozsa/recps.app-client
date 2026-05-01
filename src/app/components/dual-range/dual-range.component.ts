import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {debounceTime, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dual-range',
  templateUrl: './dual-range.component.html',
  styleUrl: './dual-range.component.css'
})
export class DualRangeComponent implements OnInit {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() initialMinValue: number | undefined = undefined;
  @Input() initialMaxValue: number | undefined = undefined;
  @Output() minValueChange = new EventEmitter<number | null>();
  @Output() maxValueChange = new EventEmitter<number | null>();

  @ViewChild('lowerInput') private lowerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('upperInput') private upperInput!: ElementRef<HTMLInputElement>;

  minValue: number | null = null;
  maxValue: number | null = null;

  private minValueDebouncer = new Subject<number | null>();
  private maxValueDebouncer = new Subject<number | null>();

  constructor() {
    this.minValueDebouncer
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe(val => this.minValueChange.emit(val));

    this.maxValueDebouncer
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe(val => this.maxValueChange.emit(val));
  }

  ngOnInit(): void {
    this.minValue = this.initialMinValue == undefined ? null : this.initialMinValue;
    this.maxValue = this.initialMaxValue == undefined ? null : this.initialMaxValue;
  }

  get lowerThumb(): number {
    return this.minValue ?? this.min;
  }

  get upperThumb(): number {
    return this.maxValue ?? this.max;
  }

  get trackFillStyle(): string {
    const range = this.max - this.min;
    const lower = ((this.lowerThumb - this.min) / range) * 100;
    const upper = ((this.upperThumb - this.min) / range) * 100;
    return `background: linear-gradient(to right,` +
      ` var(--color-base-300) ${lower}%,` +
      ` var(--color-primary) ${lower}%,` +
      ` var(--color-primary) ${upper}%,` +
      ` var(--color-base-300) ${upper}%)`;
  }

  onLowerChange(value: string): void {
    const clamped = Math.min(+value, this.upperThumb);
    this.minValue = clamped <= this.min ? null : clamped;
    this.lowerInput.nativeElement.value = String(this.lowerThumb);
    this.minValueDebouncer.next(this.minValue);
  }

  onUpperChange(value: string): void {
    const clamped = Math.max(+value, this.lowerThumb);
    this.maxValue = clamped >= this.max ? null : clamped;
    this.upperInput.nativeElement.value = String(this.upperThumb);
    this.maxValueDebouncer.next(this.maxValue);
  }
}

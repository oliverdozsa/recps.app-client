import {ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-tags-input',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './tags-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsInputComponent<T> {
  options = input<T[]>([]);
  displayFunction = input<(item: T) => string>(() => '');
  initialTags = input<T[]>([]);
  tagsChange = output<T[]>();
  queryChange = output<string>();

  tagInput = viewChild<ElementRef<HTMLInputElement>>('tagInput');

  inputValue = signal('');
  tags = signal<T[]>([]);
  focused = signal(false);
  activeIndex = signal(-1);

  filteredOptions = computed(() => {
    const display = this.displayFunction();
    const tagNames = this.tags().map(display);
    return this.options().filter(opt => !tagNames.includes(display(opt)));
  });

  showDropdown = computed(() => this.focused() && this.filteredOptions().length > 0);

  constructor() {
    effect(() => {
      const initial = this.initialTags();
      if (initial.length > 0 && this.tags().length === 0) {
        this.tags.set([...initial]);
      }
    });
  }

  focusInput(): void {
    this.tagInput()?.nativeElement.focus();
    this.activeIndex.set(-1);
    this.focused.set(true);
  }

  addTag(option: T): void {
    this.tags.update(tags => [...tags, option]);
    this.tagsChange.emit(this.tags());
    this.inputValue.set('');
    this.activeIndex.set(-1);
    this.tagInput()?.nativeElement.focus();
  }

  removeTag(tag: T): void {
    const display = this.displayFunction();
    this.tags.update(tags => tags.filter(t => display(t) !== display(tag)));
    this.tagsChange.emit(this.tags());
  }

  onInput(value: string): void {
    this.inputValue.set(value);
    this.activeIndex.set(-1);
    this.queryChange.emit(value);
  }

  onBlur(): void {
    setTimeout(() => {
      this.focused.set(false);
      this.activeIndex.set(-1);
    }, 150);
  }

  onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(Math.min(this.activeIndex() + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(Math.max(this.activeIndex() - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0 && opts[this.activeIndex()]) {
          this.addTag(opts[this.activeIndex()]);
        } else if (opts.length === 1) {
          this.addTag(opts[0]);
        }
        break;
      case 'Escape':
        this.focused.set(false);
        this.activeIndex.set(-1);
        break;
      case 'Backspace':
        if (!this.inputValue() && this.tags().length > 0) {
          this.removeTag(this.tags()[this.tags().length - 1]);
        }
        break;
    }
  }
}

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tags-input',
  imports: [FormsModule],
  templateUrl: './tags-input.component.html',
})
export class TagsInputComponent {
  @Input() options: any[] = [];
  @Input() placeholder = 'Add tags...';
  @Input() displayFunction: (item: any) => string = () => "";
  @Output() tagsChange = new EventEmitter<any[]>();
  @Output() queryChange = new EventEmitter<string>();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  get externalOptions(): any[] | null {
    return this._externalOptions
  }

  @Input()
  set externalOptions(value: any[]) {
    this._externalOptions = value;
    this.showDropdown = this.filteredOptions.length > 0 && this.focused;
  }

  _externalOptions: any[] | null = null;

  inputValue = '';
  tags: any[] = [];
  showDropdown = false;
  activeIndex = -1;
  focused = false;

  get filteredOptions(): any[] {
    if (this.externalOptions !== null) {
      return this.externalOptions.filter(opt => this.isNotPresent(opt));
    }
    if (!this.inputValue.trim()) return [];
    const lower = this.inputValue.toLowerCase();
    return this.options.filter(
      opt => opt.toLowerCase().includes(lower) && this.isNotPresent(opt)
    );
  }

  focusInput(): void {
    this.tagInput.nativeElement.focus();
    this.activeIndex = -1;
    this.showDropdown = this.filteredOptions.length > 0;
    this.focused = true;
  }

  addTag(option: string): void {
    if (this.isNotPresent(option)) {
      this.tags = [...this.tags, option];
      this.tagsChange.emit(this.tags);
    }
    this.inputValue = '';
    this.showDropdown = false;
    this.activeIndex = -1;
    this.tagInput.nativeElement.focus();
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => this.displayFunction(t) !== this.displayFunction(tag));
    this.tagsChange.emit(this.tags);
  }

  onInput(): void {
    this.activeIndex = -1;
    this.queryChange.emit(this.inputValue);
    this.showDropdown = this.filteredOptions.length > 0;
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;
      this.activeIndex = -1;
      this.focused = false;
    }, 150);
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.showDropdown) {
          this.activeIndex = Math.min(this.activeIndex + 1, options.length - 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0 && options[this.activeIndex]) {
          this.addTag(options[this.activeIndex]);
        } else if (options.length === 1) {
          this.addTag(options[0]);
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        this.activeIndex = -1;
        break;
      case 'Backspace':
        if (!this.inputValue && this.tags.length > 0) {
          this.removeTag(this.tags[this.tags.length - 1]);
        }
        break;
    }
  }

  isNotPresent(option: any): boolean {
    const tagsAsString = this.tags.map(tag => this.displayFunction(tag))
    const optionAsString = this.displayFunction(option);

    return !tagsAsString.includes(optionAsString);
  }
}

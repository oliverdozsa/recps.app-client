import {ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {forkJoin, of, Subject} from 'rxjs';
import {debounceTime, switchMap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';
import {IngredientsService, SearchSource} from '../../services/ingredients.service';
import {LanguageService} from '../../services/language.service';
import {Chip, chipFromUnion} from '../../models/chip.model';

@Component({
  selector: 'app-add-ingredient-control',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './add-ingredient-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddIngredientControlComponent {
  private ingredientsService = inject(IngredientsService);
  private languageService = inject(LanguageService);

  label = input<string>('');
  existingKeys = input<Set<string>>(new Set());
  chipSelected = output<Chip>();
  backspaceOnEmpty = output<void>();

  input_ = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  open = signal(false);
  query = signal('');
  options = signal<Chip[]>([]);
  loading = signal(false);
  activeIndex = signal(-1);

  private query$ = new Subject<string>();

  constructor() {
    this.query$.pipe(
      debounceTime(300),
      switchMap(q => {
        const langId = this.languageService.selectedLanguage()?.id;
        if (q.trim().length < 2 || !langId) return of([]);
        this.loading.set(true);
        return forkJoin([
          this.ingredientsService.searchUnified(langId, q, SearchSource.Ingredients),
          this.ingredientsService.searchUnified(langId, q, SearchSource.Categories)
        ]).pipe(switchMap(([ings, cats]) => of([...ings, ...cats])));
      }),
      takeUntilDestroyed()
    ).subscribe(unions => {
      const existing = this.existingKeys();
      this.options.set(unions.map(chipFromUnion).filter(c => !existing.has(c.key)));
      this.loading.set(false);
      this.activeIndex.set(-1);
    });
  }

  startAdding() {
    this.open.set(true);
    setTimeout(() => this.input_()?.nativeElement.focus());
  }

  onInput(value: string) {
    this.query.set(value);
    this.query$.next(value);
  }

  select(chip: Chip) {
    const langId = this.languageService.selectedLanguage()?.id;
    if (chip.isCategory && langId) {
      this.ingredientsService.findByIds(langId, chip.ids).subscribe(list => {
        const joined = list.map(i => i.name).join(' / ');
        this.chipSelected.emit({...chip, label: joined || chip.label});
      });
    } else {
      this.chipSelected.emit(chip);
    }
    this.query.set('');
    this.options.set([]);
    this.activeIndex.set(-1);
    this.input_()?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent) {
    const opts = this.options();
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
          this.select(opts[this.activeIndex()]);
        } else if (opts.length === 1) {
          this.select(opts[0]);
        }
        break;
      case 'Escape':
        this.close();
        break;
      case 'Backspace':
        if (!this.query()) {
          this.backspaceOnEmpty.emit();
        }
        break;
    }
  }

  onBlur() {
    setTimeout(() => this.close(), 150);
  }

  close() {
    this.open.set(false);
    this.query.set('');
    this.options.set([]);
    this.activeIndex.set(-1);
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeSearchResultDisplayComponent } from './recipe-search-result-display.component';

describe('RecipeSearchResultDisplayComponent', () => {
  let component: RecipeSearchResultDisplayComponent;
  let fixture: ComponentFixture<RecipeSearchResultDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeSearchResultDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeSearchResultDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

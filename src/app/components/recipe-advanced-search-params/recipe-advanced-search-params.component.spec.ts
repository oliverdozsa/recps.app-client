import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeAdvancedSearchParamsComponent } from './recipe-advanced-search-params.component';

describe('RecipeAdvancedSearchParamsComponent', () => {
  let component: RecipeAdvancedSearchParamsComponent;
  let fixture: ComponentFixture<RecipeAdvancedSearchParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeAdvancedSearchParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeAdvancedSearchParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

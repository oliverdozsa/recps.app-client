import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeMainSearchParamsComponent } from './recipe-main-search-params.component';

describe('RecipeMainSearchParamsComponent', () => {
  let component: RecipeMainSearchParamsComponent;
  let fixture: ComponentFixture<RecipeMainSearchParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeMainSearchParamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeMainSearchParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

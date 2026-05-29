import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRecipeCollectionComponent } from './new-recipe-collection.component';

describe('NewRecipeCollectionComponent', () => {
  let component: NewRecipeCollectionComponent;
  let fixture: ComponentFixture<NewRecipeCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRecipeCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRecipeCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCompactCardComponent } from './recipe-compact-card.component';

describe('RecipeCompactCardComponent', () => {
  let component: RecipeCompactCardComponent;
  let fixture: ComponentFixture<RecipeCompactCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCompactCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeCompactCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

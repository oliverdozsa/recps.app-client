import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkedRecipesComponent } from './marked-recipes.component';

describe('MarkedRecipesComponent', () => {
  let component: MarkedRecipesComponent;
  let fixture: ComponentFixture<MarkedRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkedRecipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkedRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

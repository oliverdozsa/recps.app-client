import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsInputComponent } from './ingredients-input.component';

describe('IngredientsInputComponent', () => {
  let component: IngredientsInputComponent;
  let fixture: ComponentFixture<IngredientsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

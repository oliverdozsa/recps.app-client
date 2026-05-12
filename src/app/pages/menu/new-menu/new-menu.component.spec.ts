import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMenuComponent } from './new-menu.component';

describe('NewMenuComponent', () => {
  let component: NewMenuComponent;
  let fixture: ComponentFixture<NewMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

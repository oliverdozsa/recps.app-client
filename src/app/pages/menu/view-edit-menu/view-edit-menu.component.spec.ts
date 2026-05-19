import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditMenuComponent } from './view-edit-menu.component';

describe('ViewEditMenuComponent', () => {
  let component: ViewEditMenuComponent;
  let fixture: ComponentFixture<ViewEditMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

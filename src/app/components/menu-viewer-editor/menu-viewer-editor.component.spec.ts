import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuViewerEditorComponent } from './menu-viewer-editor.component';

describe('MenuViewerEditorComponent', () => {
  let component: MenuViewerEditorComponent;
  let fixture: ComponentFixture<MenuViewerEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuViewerEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuViewerEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

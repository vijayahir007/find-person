import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindPhotosComponent } from './find-photos.component';

describe('FindPhotosComponent', () => {
  let component: FindPhotosComponent;
  let fixture: ComponentFixture<FindPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindPhotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

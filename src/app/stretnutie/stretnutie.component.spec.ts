import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StretnutieComponent } from './stretnutie.component';

describe('StretnutieComponent', () => {
  let component: StretnutieComponent;
  let fixture: ComponentFixture<StretnutieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StretnutieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StretnutieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

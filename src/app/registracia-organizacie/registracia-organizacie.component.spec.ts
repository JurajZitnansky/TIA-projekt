import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistraciaOrganizacieComponent } from './registracia-organizacie.component';

describe('RegistraciaOrganizacieComponent', () => {
  let component: RegistraciaOrganizacieComponent;
  let fixture: ComponentFixture<RegistraciaOrganizacieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistraciaOrganizacieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistraciaOrganizacieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

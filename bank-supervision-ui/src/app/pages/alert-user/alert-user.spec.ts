import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertUser } from './alert-user';

describe('AlertUser', () => {
  let component: AlertUser;
  let fixture: ComponentFixture<AlertUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserSettings } from './users-settings';

describe('UserSettings', () => {
  let component: UserSettings;
  let fixture: ComponentFixture<UserSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettings],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

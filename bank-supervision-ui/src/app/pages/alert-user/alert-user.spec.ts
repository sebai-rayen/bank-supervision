import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AlertUser } from './alert-user';

describe('AlertUser', () => {
  let component: AlertUser;
  let fixture: ComponentFixture<AlertUser>;

  beforeEach(async () => {
    localStorage.setItem('currentUser', JSON.stringify({ fullName: 'Test User' }));

    await TestBed.configureTestingModule({
      imports: [AlertUser],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

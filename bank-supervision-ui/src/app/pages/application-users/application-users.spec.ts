import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ApplicationUsers } from './application-users';

describe('ApplicationUsers', () => {
  let component: ApplicationUsers;
  let fixture: ComponentFixture<ApplicationUsers>;

  beforeEach(async () => {
    localStorage.setItem('currentUser', JSON.stringify({ fullName: 'Test User' }));

    await TestBed.configureTestingModule({
      imports: [ApplicationUsers],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationUsers);
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationUsers } from './application-users';

describe('ApplicationUsers', () => {
  let component: ApplicationUsers;
  let fixture: ComponentFixture<ApplicationUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

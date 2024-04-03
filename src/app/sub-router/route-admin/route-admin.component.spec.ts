import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RouteAdminComponent } from './route-admin.component';

describe('RouteAdminComponent', () => {
  let component: RouteAdminComponent;
  let fixture: ComponentFixture<RouteAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

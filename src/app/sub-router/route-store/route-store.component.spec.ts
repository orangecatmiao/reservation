import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RouteStoreComponent } from './route-store.component';

describe('RouteStoreComponent', () => {
  let component: RouteStoreComponent;
  let fixture: ComponentFixture<RouteStoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

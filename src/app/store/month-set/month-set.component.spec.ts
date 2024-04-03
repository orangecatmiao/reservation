import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonthSetComponent } from './month-set.component';

describe('MonthSetComponent', () => {
  let component: MonthSetComponent;
  let fixture: ComponentFixture<MonthSetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

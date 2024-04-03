import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScheduleShowComponent } from './schedule-show.component';

describe('ScheduleShowComponent', () => {
  let component: ScheduleShowComponent;
  let fixture: ComponentFixture<ScheduleShowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DuringSetComponent } from './during-set.component';

describe('DuringSetComponent', () => {
  let component: DuringSetComponent;
  let fixture: ComponentFixture<DuringSetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DuringSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuringSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

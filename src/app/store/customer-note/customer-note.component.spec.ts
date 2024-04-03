import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomerNoteComponent } from './customer-note.component';

describe('CustomerNoteComponent', () => {
  let component: CustomerNoteComponent;
  let fixture: ComponentFixture<CustomerNoteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

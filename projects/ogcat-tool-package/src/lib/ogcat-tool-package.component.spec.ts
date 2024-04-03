import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OgcatToolPackageComponent } from './ogcat-tool-package.component';

describe('OgcatToolPackageComponent', () => {
  let component: OgcatToolPackageComponent;
  let fixture: ComponentFixture<OgcatToolPackageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OgcatToolPackageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OgcatToolPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

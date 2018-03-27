import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuySpotComponent } from './buy-spot.component';

describe('BuySpotComponent', () => {
  let component: BuySpotComponent;
  let fixture: ComponentFixture<BuySpotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuySpotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuySpotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

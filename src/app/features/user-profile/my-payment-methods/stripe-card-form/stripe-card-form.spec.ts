import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCardForm } from './stripe-card-form';

describe('StripeCardForm', () => {
  let component: StripeCardForm;
  let fixture: ComponentFixture<StripeCardForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeCardForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StripeCardForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

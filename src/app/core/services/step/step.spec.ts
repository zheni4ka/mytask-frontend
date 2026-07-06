import { TestBed } from '@angular/core/testing';

import { Step } from './step';

describe('Step', () => {
  let service: Step;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Step);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

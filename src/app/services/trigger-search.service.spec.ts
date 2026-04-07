import { TestBed } from '@angular/core/testing';

import { TriggerSearchService } from './trigger-search.service';

describe('TriggerSearchService', () => {
  let service: TriggerSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriggerSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

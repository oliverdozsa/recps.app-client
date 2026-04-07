import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TriggerSearchService {
  trigger$ = new Subject<void>();

  constructor() { }
}

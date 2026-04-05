import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LanguageResponse} from './responses';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAll(): Observable<LanguageResponse[]> {
    return this.http.get<LanguageResponse[]>(`${this.baseUrl}/languages`);
  }
}

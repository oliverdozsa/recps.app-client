import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {LanguageResponse} from './responses';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  languages = signal<LanguageResponse[]>([]);

  getAll(): Observable<LanguageResponse[]> {
    return this.http.get<LanguageResponse[]>(`${this.baseUrl}/languages`).pipe(
      tap(langs => this.languages.set(langs))
    );
  }
}

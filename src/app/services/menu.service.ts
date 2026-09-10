import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MenuPlanDetailedResponse, MenuPlanSimplifiedResponse} from './responses';
import {CreateUpdateMenuPlanRequest} from './requests';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAll(): Observable<MenuPlanSimplifiedResponse[]> {
    return this.http.get<MenuPlanSimplifiedResponse[]>(`${this.baseUrl}/menus`);
  }

  getById(id: number, languageId?: number): Observable<MenuPlanDetailedResponse> {
    const params: Record<string, string> = {};
    if (languageId !== undefined) {
      params['languageId'] = String(languageId);
    }
    return this.http.get<MenuPlanDetailedResponse>(`${this.baseUrl}/menus/${id}`, {params});
  }

  create(request: CreateUpdateMenuPlanRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/menus/create`, request);
  }

  update(id: number, request: CreateUpdateMenuPlanRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/menus/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/menus/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApplicationApi {
  id?: number;
  name: string;
  servers: string;
  version: string;
  status: string;
  lastCheck?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/applications';

  getApplications(): Observable<ApplicationApi[]> {
    return this.http.get<ApplicationApi[]>(this.apiUrl);
  }

  addApplication(application: ApplicationApi): Observable<ApplicationApi> {
    return this.http.post<ApplicationApi>(this.apiUrl, application);
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getApplicationById(id: number): Observable<ApplicationApi> {
    return this.http.get<ApplicationApi>(`${this.apiUrl}/${id}`);
  }

  updateApplication(id: number, application: ApplicationApi): Observable<ApplicationApi> {
    return this.http.put<ApplicationApi>(`${this.apiUrl}/${id}`, application);
  }
}
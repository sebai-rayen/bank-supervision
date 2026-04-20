import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServerApi {
  id?: number;
  name: string;
  ipAddress: string;
  port?: number;
  os?: string;
  system?: string;
  status?: string;
  lastCheck?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/servers';

  getServers(): Observable<ServerApi[]> {
    return this.http.get<ServerApi[]>(this.apiUrl);
  }

  addServer(server: ServerApi): Observable<ServerApi> {
    return this.http.post<ServerApi>(this.apiUrl, server);
  }

  deleteServer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getServerById(id: number): Observable<ServerApi> {
    return this.http.get<ServerApi>(`${this.apiUrl}/${id}`);
  }

  updateServer(id: number, server: ServerApi): Observable<ServerApi> {
    return this.http.put<ServerApi>(`${this.apiUrl}/${id}`, server);
  }
}

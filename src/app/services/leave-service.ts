import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Leave } from '../models/leave';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/leaves';

  getLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(this.apiUrl);
  }

  addLeaves(leave: Leave): Observable<Leave> {
    return this.http.post<Leave>(this.apiUrl, leave);
  }

  updateLeave(id:number, leave: Leave): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/${id}`,leave);
  }

  deleteLeave(id:number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}

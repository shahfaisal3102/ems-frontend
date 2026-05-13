import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attendance } from '../models/attendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
   private http = inject(HttpClient);

   private apiUrl = "http://localhost:3000/attendance";

   getAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.apiUrl);
   }

   addAttendance(attendance: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(
      this.apiUrl,
      attendance
    );
   }

   updateAttendance(id:number, attendance: Attendance): Observable<Attendance> {
    return this.http.put<Attendance>(
      `${this.apiUrl}/${id}`,
      attendance
    );
   }

   deleteAttendance(id:number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
   }
}

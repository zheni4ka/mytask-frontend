import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, CreateAssignmentModel, UpdateAssignmentModel } from '../../models/assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService 
{
    private http = inject(HttpClient);

    private apiUrl = 'https://localhost:5196/api/assignments'; 

    getAssignments(): Observable<Assignment[]> {
        return this.http.get<Assignment[]>(this.apiUrl);
    }

    getAssignmentById(id: number): Observable<Assignment> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Assignment>(url);
    }

    createAssignment(assignment: CreateAssignmentModel): Observable<Assignment> {
        return this.http.post<Assignment>(this.apiUrl, assignment);
    }

    updateAssignment(id: number, assignment: UpdateAssignmentModel): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<void>(url, assignment);
    }

    deleteAssignment(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url);
    }


}

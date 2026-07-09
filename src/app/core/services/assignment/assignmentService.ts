import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, CreateAssignmentModel, PagedResult, UpdateAssignmentModel } from '../../models/assignment.model';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root',
})

export class AssignmentService 
{
    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/Assignment`; 

    getAssignments(pageNumber: number = 1, pageSize: number = 10, categoryId: number | null, searchTerm: string, sortBy: string, sortDescending: boolean): Observable<PagedResult<Assignment>> {
    return this.http.get<PagedResult<Assignment>>(
      `${this.apiUrl}/api/Assignment/all?pageNumber=${pageNumber}&pageSize=${pageSize}&CategoryId=${categoryId}&SearchTerm=${searchTerm}&SortBy=${sortBy}&SortDescending=${sortDescending}`
    );
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

    getLatestByCategoryId(id: number): Observable<Assignment> {
        const url = `${this.apiUrl}/latest/${id}`
        return this.http.get<Assignment>(url);
    }

    getByCategoryId(id: number): Observable<Assignment[]>
    {
        const url = `${this.apiUrl}/by-category/${id}`
        return this.http.get<Assignment[]>(url);
    }

    getOverdueAssignments(): Observable<Assignment[]>
    {
        const url = `${this.apiUrl}/overdue`;
        return this.http.get<Assignment[]>(url);
    }

    getUpcomingAssignments(days: number) : Observable<Assignment[]>
    {
        const url = `${this.apiUrl}/upcoming/${days}`;
        return this.http.get<Assignment[]>(url);
    }

}

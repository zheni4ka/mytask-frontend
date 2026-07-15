import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Assignment,
  CreateAssignmentModel,
  PagedResult,
  UpdateAssignmentModel,
} from '../../models/assignment.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/Assignment`;

  getAssignments(
    pageNumber: number = 1,
    pageSize: number = 10,
    categoryId: number | null,
    searchTerm: string,
    sortBy: string,
    sortDescending: boolean,
    isImportant: boolean | null,
  ): Observable<PagedResult<Assignment>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('SortDescending', sortDescending);

    if (categoryId && categoryId > 0) {
      params = params.set('CategoryId', categoryId);
    }
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('SearchTerm', searchTerm);
    }
    if (isImportant !== undefined && isImportant !== null) {
      params = params.set('IsImportant', isImportant.toString());
    }
    if (sortBy) {
      params = params.set('SortBy', sortBy);
    }

    console.log(params);
    return this.http.get<PagedResult<Assignment>>(`${this.apiUrl}/all`, { params });
  }

  getAssignmentById(id: number): Observable<Assignment> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Assignment>(url);
  }

  createAssignment(assignment: CreateAssignmentModel): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment);
  }

  updateAssignment(assignment: UpdateAssignmentModel): Observable<void> {
    return this.http.put<void>(this.apiUrl, assignment);
  }

  deleteAssignment(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  addToCalendar(assignmentId: number, googleAccessToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-to-calendar`, {
      assignmentId: assignmentId,
      googleAccessToken: googleAccessToken,
    });
  }

  removeFromCalendar(assignmentId: number, googleAccessToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/remove-from-calendar`, {
      assignmentId: assignmentId,
      googleAccessToken: googleAccessToken,
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateStepModel, Step, UpdateStepModel } from '../../models/step.model';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class StepService 
{
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/steps`;

    getSteps(): Observable<Step[]> {
        return this.http.get<Step[]>(this.apiUrl);
    }

    getStepById(id: number): Observable<Step> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Step>(url);
    }

    createStep(step: CreateStepModel): Observable<Step> {
        return this.http.post<Step>(this.apiUrl, step);
    }

    updateStep(step: UpdateStepModel): Observable<void> {
        const url = `${this.apiUrl}`;
        return this.http.put<void>(url, step);
    }

    getByAssignmentId(assignmentId: number): Observable<Step[]>
    {
        const url = `${this.apiUrl}/by-assignment/${assignmentId}`;
        return this.http.get<Step[]>(url);
    }

}

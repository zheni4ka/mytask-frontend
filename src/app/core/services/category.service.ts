import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryModel, UpdateCategoryModel } from '../models/category.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Categories`;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Category>(url);
  }

  createCategory(category: CreateCategoryModel): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(category: UpdateCategoryModel): Observable<void> {
    const url = `${this.apiUrl}`;
    return this.http.put<void>(url, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

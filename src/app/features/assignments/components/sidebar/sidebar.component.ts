import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CreateCategoryModel } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { UpdateCategoryModel } from '../../../../core/models/category.model';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  matAssignment, 
  matAdd, 
  matDelete, 
  matStar, 
  matFormatListBulleted,
  matEdit, 
  matCheck,
  matClose,
  matCheckCircle,
  matErrorOutline
} from '@ng-icons/material-icons/baseline';
import { animate, sequence, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  
  providers: [provideIcons({ 
    matAssignment, 
    matAdd, 
    matDelete, 
    matStar, 
    matFormatListBulleted,
    matEdit,
    matCheck,
    matClose,
    matCheckCircle,
    matErrorOutline
  })],
  
  templateUrl: './sidebar.component.html',
  animations: [
    trigger('listAnimation', [
      transition(':enter', sequence([
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])),
      transition(':leave', animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(50px)' })))
      
    ])
  ]
})
export class SidebarComponent {
  private categoryService = inject(CategoryService);

  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() isImportantSelected: boolean | null = null;
  @Input() isOverdueSelected: boolean | null = null;
  @Input() isCompletedSelected: boolean | null = null;

  @Output() filterSelect = new EventEmitter<{categoryId: number | null, important: boolean | null, overdue: boolean | null, completed: boolean | null}>();
  @Output() categoriesChanged = new EventEmitter<void>(); 

  isAddingCategory = signal(false);
  editingCategoryId = signal<number | null>(null);

  newCategoryName = '';
  editingCategoryName = '';

  onSelect(id: number | null, important: boolean | null, overdue: boolean | null, completed: boolean | null) {
    this.filterSelect.emit({ categoryId: id, important, overdue, completed });
  }

  toggleAddCategory() {
    this.isAddingCategory.update(val => !val);
    this.newCategoryName = '';
  }

  saveCategory() {
    if (!this.newCategoryName.trim()) return;

    const newCat: CreateCategoryModel = { name: this.newCategoryName.trim() };
    
    this.categoryService.createCategory(newCat).subscribe({
      next: () => {
        this.isAddingCategory.set(false);
        this.newCategoryName = '';
        this.categoriesChanged.emit();
      }
    });
  }

  deleteCategory(event: Event, id: number) {
    event.stopPropagation();
    if (confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => this.categoriesChanged.emit()
      });
    }
  }

  startEditCategory(event: Event, category: Category) {
    event.stopPropagation();
    this.editingCategoryId.set(category.id);
    this.editingCategoryName = category.name;
  }

  cancelEditCategory(event: Event) {
    event.stopPropagation();
    this.editingCategoryId.set(null);
    this.editingCategoryName = '';
  }

  saveEditCategory(event?: Event) {
    if (event) event.stopPropagation();
    const currentEditId = this.editingCategoryId();
    
    if (!this.editingCategoryName.trim() || currentEditId === null) return;

    const updatedCat: UpdateCategoryModel = { 
      id: currentEditId, 
      name: this.editingCategoryName.trim() 
    };

    this.categoryService.updateCategory(updatedCat).subscribe({
      next: () => {
        this.editingCategoryId.set(null);
        this.categoriesChanged.emit();
      }
    });
  }

  resetAllFilters() {
    this.filterSelect.emit({ 
      categoryId: null, important: null, overdue: null, completed: null 
    });
  }

  toggleFilter(filterType: 'important' | 'completed' | 'overdue') {
    const currentState = {
      categoryId: this.selectedCategoryId,
      important: this.isImportantSelected,
      completed: this.isCompletedSelected,
      overdue: this.isOverdueSelected
    };

    if (filterType === 'important') currentState.important = currentState.important ? null : true;
    if (filterType === 'completed') currentState.completed = currentState.completed ? null : true;
    if (filterType === 'overdue') currentState.overdue = currentState.overdue ? null : true;

    this.filterSelect.emit(currentState);
  }

  selectCategory(categoryId: number | null) {
    this.filterSelect.emit({
      categoryId: categoryId,
      important: this.isImportantSelected,
      completed: this.isCompletedSelected,
      overdue: this.isOverdueSelected
    });
  }
}
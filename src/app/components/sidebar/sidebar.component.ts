import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CreateCategoryModel } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category/categoryService';
import { UpdateCategoryModel } from '../../core/models/category.model';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  matAssignment, 
  matAdd, 
  matDelete, 
  matStar, 
  matFormatListBulleted,
  matEdit, 
  matCheck,
  matClose
} from '@ng-icons/material-icons/baseline';

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
    matClose
  })],
  
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private categoryService = inject(CategoryService);

  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() isImportantSelected: boolean | null = null;

  @Output() filterSelect = new EventEmitter<{categoryId: number | null, important: boolean | null}>();
  @Output() categoryCreated = new EventEmitter<void>();
  @Output() categoriesChanged = new EventEmitter<void>();

  isAddingCategory = false;
  newCategoryName = '';

  editingCategoryId: number | null = null;
  editingCategoryName = '';

  onSelect(id: number | null, important: boolean | null) {
    this.filterSelect.emit({ categoryId: id, important: important });
  }

  toggleAddCategory() {
    this.isAddingCategory = !this.isAddingCategory;
    this.newCategoryName = '';
  }

  saveCategory() {
    if (!this.newCategoryName.trim()) return;

    const newCat: CreateCategoryModel = { name: this.newCategoryName.trim() };
    
    this.categoryService.createCategory(newCat).subscribe({
      next: () => {
        this.isAddingCategory = false;
        this.newCategoryName = '';
        this.categoryCreated.emit();
      },
      error: (err) => console.error('Помилка створення категорії:', err)
    });
  }

  deleteCategory(event: Event, id: number) {
    event.stopPropagation();

    if (confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categoriesChanged.emit();
        },
        error: (err) => console.error('Помилка видалення категорії:', err)
      });
    }
  }

  startEditCategory(event: Event, category: Category) {
    event.stopPropagation();
    this.editingCategoryId = category.id;
    this.editingCategoryName = category.name;
  }

  cancelEditCategory(event: Event) {
    event.stopPropagation();
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

  saveEditCategory(event?: Event) {
    if (event) event.stopPropagation();
    if (!this.editingCategoryName.trim() || this.editingCategoryId === null) return;

    const updatedCat: UpdateCategoryModel = { 
      id: this.editingCategoryId, 
      name: this.editingCategoryName.trim() 
    };

    this.categoryService.updateCategory(updatedCat).subscribe({
      next: () => {
        this.editingCategoryId = null;
        this.categoriesChanged.emit();
      },
      error: (err) => console.error('Помилка оновлення категорії:', err)
    });
  }

}
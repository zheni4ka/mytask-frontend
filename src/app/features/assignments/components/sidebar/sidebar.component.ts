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
  @Output() categoriesChanged = new EventEmitter<void>(); 

  isAddingCategory = signal(false);
  editingCategoryId = signal<number | null>(null);

  newCategoryName = '';
  editingCategoryName = '';

  onSelect(id: number | null, important: boolean | null) {
    this.filterSelect.emit({ categoryId: id, important });
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
}
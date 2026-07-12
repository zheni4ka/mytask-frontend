import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../core/models/category.model';

import { heroPencilSquareSolid } from '@ng-icons/heroicons/solid';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({heroPencilSquareSolid})],
  templateUrl: './sidebar.component.html',
})

export class SidebarComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() isImportantSelected: boolean | null = null;

  @Output() filterSelect = new EventEmitter<{categoryId: number | null, important: boolean | null}>();

  onSelect(id: number | null, important: boolean | null) {
    this.filterSelect.emit({ categoryId: id, important: important });
  }
}
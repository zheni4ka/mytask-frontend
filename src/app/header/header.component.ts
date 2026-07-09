import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { heroMagnifyingGlassCircleSolid } from '@ng-icons/heroicons/solid';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [provideIcons({heroMagnifyingGlassCircleSolid})],
  templateUrl: `./header.component.html`
})
export class HeaderComponent {
  @Input() selectedCategoryId: number | null = null;
  @Input() searchTerm = '';
  @Input() sortBy = 'duedate';
  @Input() sortDescending = false;

  @Output() filterChange = new EventEmitter<{term: string, by: string, desc: boolean}>();
  @Output() newTask = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onFilterChange() {
    this.filterChange.emit({
      term: this.searchTerm,
      by: this.sortBy,
      desc: this.sortDescending
    });
  }

  toggleSort() {
    this.sortDescending = !this.sortDescending;
    this.onFilterChange();
  }
}
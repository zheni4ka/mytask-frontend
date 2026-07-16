import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // Перейшли на реактивні форми
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matSearch, matKeyboardArrowUp, matKeyboardArrowDown } from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  providers: [provideIcons({ matKeyboardArrowDown, matKeyboardArrowUp, matSearch })],
  templateUrl: `./header.component.html`,
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class HeaderComponent {
  @Input() selectedCategoryId: number | null = null;
  @Input() sortBy = 'duedate';
  @Input() sortDescending = false;

  @Input() set searchTerm(value: string) {
    this.searchControl.setValue(value, { emitEvent: false });
  }

  @Output() filterChange = new EventEmitter<{
    term: string;
    by: string;
    desc: boolean;
    categoryId: number | null;
  }>();
  
  @Output() newTask = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(), 
      takeUntilDestroyed()
    ).subscribe(() => {
      this.emitFilterChange();
    });
  }

  onSortChange(newSortBy: string) {
    this.sortBy = newSortBy;
    this.emitFilterChange();
  }

  toggleSort() {
    this.sortDescending = !this.sortDescending;
    this.emitFilterChange();
  }

  private emitFilterChange() {
    this.filterChange.emit({
      term: this.searchControl.value || '',
      by: this.sortBy,
      desc: this.sortDescending,
      categoryId: this.selectedCategoryId,
    });
  }
}
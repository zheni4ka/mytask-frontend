import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../core/services/assignment/assignmentService';
import { CategoryService } from '../core/services/category/categoryService';
import { StepService } from '../core/services/step/stepService';


import { Assignment, CreateAssignmentModel, UpdateAssignmentModel } from '../core/models/assignment.model';
import { Category, CreateCategoryModel, UpdateCategoryModel } from '../core/models/category.model';
import { Step, CreateStepModel, UpdateStepModel } from '../core/models/step.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './todo-list.component.html'
})
export class TodoListComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private categoryService = inject(CategoryService);
  private stepService = inject(StepService);
  private router = inject(Router);


  tasks: Assignment[] = [];
  categories: Category[] = [];

  selectedCategoryId: number | null = 0;
  searchTerm = '';
  sortBy = 'duedate';
  sortDescending = false;

  selectedTask: Assignment | null = null;
  taskSteps: Step[] = [];
  isLoadingSteps = false;

  ngOnInit() {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => this.categories = res);
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  loadTasks() {
      this.assignmentService.getAssignments(1, 50, this.selectedCategoryId, this.searchTerm, this.sortBy, this.sortDescending)
        .subscribe({
          next: (res) => { this.tasks = res.items;  },
        });
  }
  

  onCategorySelect(id: number | null) {
    this.selectedCategoryId = id;
    this.searchTerm = ''; 
    this.loadTasks();
  }

  onFilterChange(filters: {term: string, by: string, desc: boolean}) {
    this.searchTerm = filters.term;
    this.sortBy = filters.by;
    this.sortDescending = filters.desc;
    this.selectedCategoryId = null; 
    this.loadTasks();
  }

  openTask(task: Assignment) {
    this.selectedTask = task;
    this.taskSteps = [];
    this.isLoadingSteps = true;

    this.stepService.getByAssignmentId(task.id).subscribe({
      next: (steps) => { this.taskSteps = steps; this.isLoadingSteps = false; },
      error: () => { this.taskSteps = []; this.isLoadingSteps = false; }
    });
  }

  openNewTaskModal() {
    this.selectedTask = {
      id: 0, 
      title: '',
      description: '',
      categoryId: this.selectedCategoryId || 0,
      userId: '',
      dueDate: new Date().toISOString(),
      refreshType: null,
      isCompleted: false
    };
    
    this.taskSteps = [];
    this.isLoadingSteps = false;
  }

  onAddStep(title: string) {
    if (!this.selectedTask) return;
    
    // Тут має бути виклик this.stepService.create(...)
    // Після успіху перезавантажуємо кроки
  }

  onToggleStep(step: Step) {
    // Тут має бути виклик this.stepService.update(step)
  }
}
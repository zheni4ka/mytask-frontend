import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../core/services/assignment/assignmentService';
import { CategoryService } from '../../core/services/category/categoryService';
import { StepService } from '../../core/services/step/stepService';
import { MatDialog } from '@angular/material/dialog';

import { TaskCardComponent } from '../task-card/task-card.component';
import { Assignment, CreateAssignmentModel, PagedResult, UpdateAssignmentModel } from '../../core/models/assignment.model';
import { Category, CreateCategoryModel, UpdateCategoryModel } from '../../core/models/category.model';
import { Step, CreateStepModel, UpdateStepModel } from '../../core/models/step.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AssignmentModalComponent } from '../assignment-modal/assignment-modal.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, TaskCardComponent],
  templateUrl: './todo-list.component.html'
})
export class TodoListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private assignmentService = inject(AssignmentService);
  private categoryService = inject(CategoryService);
  private stepService = inject(StepService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  tasks: Assignment[] = [];
  categories: Category[] = [];

  selectedCategoryId: number | null = null;
  searchTerm = '';
  sortBy = 'duedate';
  sortDescending = false;
  isImportantFilter : boolean | null = null;

  selectedTask: Assignment | null = null;
  taskSteps: Step[] = [];
  isLoadingSteps = false;

  ngOnInit() {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      const categoryIdParam = params['category']; 
      const importantParam = params['important'];

      if(importantParam === 'true')
      {{
        this.selectedCategoryId = null;
        this.isImportantFilter = null
      }}
      if (categoryIdParam) {
        this.selectedCategoryId = Number(categoryIdParam);
        this.isImportantFilter = null;
      } else {
        this.selectedCategoryId = null;
        this.isImportantFilter = null;
      }

      this.loadTasks(); 
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => this.categories = res);
    this.cdr.detectChanges();
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  

  loadTasks() {
  this.assignmentService.getAssignments(
    this.currentPage, 
    this.pageSize, 
    this.selectedCategoryId, 
    this.searchTerm, 
    this.sortBy,
    this.sortDescending,
    this.isImportantFilter
  ).subscribe({
    next: (res: PagedResult<Assignment>) => { 
      this.tasks = res.items;
      this.totalPages = res.totalPages;
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Помилка завантаження тасок:', err)
  });
}
  

  onSidebarSelect(filter: {categoryId: number | null, important: boolean | null}) {
    this.searchTerm = ''; 
    this.currentPage = 1; 
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        category: filter.categoryId,
        important: filter.important ? 'true' : null 
      }
    });
  }

  onFilterChange(filters: {term: string, by: string, desc: boolean, categoryId : number | null}) {
    this.searchTerm = filters.term;
    this.sortBy = filters.by;
    this.sortDescending = filters.desc;
    this.selectedCategoryId = filters.categoryId; 
    this.loadTasks();
  }


  openTask(task: Assignment) {
    this.stepService.getByAssignmentId(task.id).subscribe({
      next: (steps) => {
        this.openDialog(task, steps);
      },
      error: () => this.openDialog(task, [])
    });
  }

  openNewTaskModal() {
    const newTask: Assignment = {
      id: 0, 
      title: '',
      description: '',
      categoryId: this.selectedCategoryId || (this.categories.length > 0 ? this.categories[0].id : 0),
      userId: '',
      dueDate: new Date().toISOString().slice(0, 16), 
      refreshType: null,
      isCompleted: false,
      isImportant: false,
      totalSteps: 0,
      completedSteps: 0
    };
    this.openDialog(newTask, []);
  }

  private openDialog(task: Assignment, taskSteps: Step[]) {
    const dialogRef = this.dialog.open(AssignmentModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container', 
      data: { task, categories: this.categories, taskSteps }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'save') {
          this.saveTask(result.task);
        } else if (result.action === 'delete') {
          this.deleteTask(result.taskId);
        }
      } else {
        this.loadTasks(); 
      }
    });
  }


  saveTask(taskToSave: Assignment) {
    if (taskToSave.id === 0) {
      const newTask: CreateAssignmentModel = {
        title: taskToSave.title,
        description: taskToSave.description || '', 
        categoryId: Number(taskToSave.categoryId),
        dueDate: taskToSave.dueDate,
        refreshType: taskToSave.refreshType,
        isCompleted: taskToSave.isCompleted,
        isImportant: taskToSave.isImportant
      };

      this.assignmentService.createAssignment(newTask).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Помилка створення:', err)
      });
    } else {
      const updatedTask: UpdateAssignmentModel = {
        id: taskToSave.id,
        title: taskToSave.title,
        description: taskToSave.description || '',
        categoryId: Number(taskToSave.categoryId),
        dueDate: taskToSave.dueDate,
        refreshType: taskToSave.refreshType,
        isCompleted: taskToSave.isCompleted,
        isImportant: taskToSave.isImportant
      };

      this.assignmentService.updateAssignment(updatedTask).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Помилка оновлення:', err)
      });
    }
  }

  deleteTask(taskId: number) {
    this.assignmentService.deleteAssignment(taskId).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Помилка видалення:', err)
    });

    this.loadTasks();

  }

  onToggleTaskCompletion(task: Assignment) {
    const originalStatus = task.isCompleted;
    
    task.isCompleted = !task.isCompleted;

    const updatedTask: UpdateAssignmentModel = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      categoryId: Number(task.categoryId),
      dueDate: task.dueDate,
      refreshType: task.refreshType,
      isCompleted: task.isCompleted,
      isImportant: task.isImportant
    };

    this.assignmentService.updateAssignment(updatedTask).subscribe({
      next: () => {
        if (task.isCompleted && task.refreshType !== null) {
          this.loadTasks();
        }
      },
      error: (err) => {
        console.error('Помилка оновлення статусу:', err);
        task.isCompleted = originalStatus;
      }
    });
  }

}
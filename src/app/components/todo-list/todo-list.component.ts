import { Component, OnInit, inject } from '@angular/core';
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

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  tasks: Assignment[] = [];
  categories: Category[] = [];

  selectedCategoryId: number | null = null;
  searchTerm = '';
  sortBy = 'duedate';
  sortDescending = false;

  selectedTask: Assignment | null = null;
  taskSteps: Step[] = [];
  isLoadingSteps = false;

  ngOnInit() {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      const categoryIdParam = params['category']; 
      
      if (categoryIdParam) {
        this.selectedCategoryId = Number(categoryIdParam);
      } else {
        this.selectedCategoryId = null;
      }

      this.loadTasks(); 
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => this.categories = res);
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
    this.sortDescending
  ).subscribe({
    next: (res: PagedResult<Assignment>) => { 
      this.tasks = res.items;
      this.totalPages = res.totalPages;
    },
    error: (err) => console.error('Помилка завантаження тасок:', err)
  });
}
  

  onCategorySelect(id: number | null) {
    this.searchTerm = ''; 
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: id }, 
      queryParamsHandling: 'merge'   
    });
  }

  onFilterChange(filters: {term: string, by: string, desc: boolean}) {
    this.searchTerm = filters.term;
    this.sortBy = filters.by;
    this.sortDescending = filters.desc;
    this.selectedCategoryId = 0; 
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
      dueDate: new Date().toISOString().slice(0, 16), // Format for datetime-local
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

  onAddStep(title: string) {
  if (!this.selectedTask || !this.selectedTask.id || !title.trim()) return;
  
  const newStep: CreateStepModel = {
    title: title.trim(),
    assignmentId: this.selectedTask.id,
    isCompleted: false
  };

  this.stepService.createStep(newStep).subscribe({
    next: () => {
      this.openTask(this.selectedTask!); 
      this.loadTasks(); 
    },
    error: (err) => console.error('Помилка створення кроку:', err)
  });
}

onToggleStep(step: Step) {
  const updatedStep: UpdateStepModel = {
    id: step.id,
    title: step.title,
    assignmentId: step.assignmentId,
    isCompleted: !step.isCompleted
  };

  this.stepService.updateStep(updatedStep).subscribe({
    next: () => {
      step.isCompleted = updatedStep.isCompleted; 
      this.loadTasks(); 
    },
    error: (err) => {
      console.error('Помилка оновлення кроку:', err);
      step.isCompleted = !updatedStep.isCompleted; 
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
    this.loadTasks()
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
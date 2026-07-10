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
import { AssignmentModalComponent } from '../assignment-modal/assignment-modal.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, AssignmentModalComponent],
  templateUrl: './todo-list.component.html'
})
export class TodoListComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private categoryService = inject(CategoryService);
  private stepService = inject(StepService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


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
      const categoryIdParam = params['category']; // Шукаємо ?category=... в URL
      
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
    this.assignmentService.getAssignments(1, 50, this.selectedCategoryId, this.searchTerm, this.sortBy, this.sortDescending)
      .subscribe({
        next: (res: any) => { 
          if (Array.isArray(res)) {
            this.tasks = res;
          } else if (res && res.items) {
            this.tasks = res.items;
          } else {
            this.tasks = [];
          }
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

  saveTask() {
    if (!this.selectedTask) return;

    
    if (!this.selectedTask.id || this.selectedTask.id === 0) {
      
      
      const newTask: CreateAssignmentModel = {
        title: this.selectedTask.title,
        description: this.selectedTask.description || '', 
        categoryId: Number(this.selectedTask.categoryId),
        dueDate: this.selectedTask.dueDate,
        refreshType: null,
        isCompleted: false
      };

      this.assignmentService.createAssignment(newTask).subscribe({
        next: () => {
          this.loadTasks();
          this.selectedTask = null;
        },
        error: (err) => console.error('Помилка створення:', err)
      });

    } else {
      
      const updatedTask: UpdateAssignmentModel = {
        id: this.selectedTask.id,
        title: this.selectedTask.title,
        description: this.selectedTask.description || '',
        categoryId: Number(this.selectedTask.categoryId),
        dueDate: this.selectedTask.dueDate,
        refreshType: this.selectedTask.refreshType,
        isCompleted: this.selectedTask.isCompleted
      };

      this.assignmentService.updateAssignment(updatedTask).subscribe({
        next: () => {
          this.loadTasks();
          this.selectedTask = null;
        },
        error: (err) => console.error('Помилка оновлення:', err)
      });
    }
  }

  deleteTask() {
    if (!this.selectedTask || this.selectedTask.id === 0) return;

    this.assignmentService.deleteAssignment(this.selectedTask.id).subscribe({
      next: () => {
        this.loadTasks();
        this.selectedTask = null;
      },
      error: (err) => console.error('Помилка видалення:', err)
    });
  }

}
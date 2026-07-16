import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { CategoryService } from '../../../../core/services/category.service';
import { StepService } from '../../../../core/services/step.service';
import { MatDialog } from '@angular/material/dialog';

import { TaskCardComponent } from '../../components/assignment-card/assignment-card.component';
import {
  Assignment,
  CreateAssignmentModel,
  PagedResult,
  UpdateAssignmentModel,
} from '../../../../core/models/assignment.model';
import {
  Category,
  CreateCategoryModel,
  UpdateCategoryModel,
} from '../../../../core/models/category.model';
import { Step, CreateStepModel, UpdateStepModel } from '../../../../core/models/step.model';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AssignmentModalComponent } from '../../components/assignment-modal/assignment-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, TaskCardComponent],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
  private dialog = inject(MatDialog);
  private assignmentService = inject(AssignmentService);
  private categoryService = inject(CategoryService);
  private stepService = inject(StepService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private socialAuthService = inject(SocialAuthService);

  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);

  tasks = signal<Assignment[]>([]);
  categories = signal<Category[]>([]);

  selectedCategoryId = signal<number | null>(null);
  searchTerm = signal('');
  sortBy = signal('duedate');
  sortDescending = signal(false);
  isImportantFilter = signal<boolean | null>(null);

  ngOnInit() {
    this.loadCategories();

    this.route.queryParams.subscribe((params) => {
      const categoryIdParam = params['category'];
      const importantParam = params['important'];

      if (importantParam === 'true') {
        this.selectedCategoryId.set(null);
        this.isImportantFilter.set(true);
      } else if (categoryIdParam) {
        this.selectedCategoryId.set(Number(categoryIdParam));
        this.isImportantFilter.set(null);
      } else {
        this.selectedCategoryId.set(null);
        this.isImportantFilter.set(null);
      }

      this.loadTasks();
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((res) => this.categories.set(res));
  }

onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    this.socialAuthService.signOut()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch(() => {
        this.router.navigate(['/login']);
      });
  }

  loadTasks() {
    this.assignmentService
      .getAssignments(
        this.currentPage(),
        this.pageSize(),
        this.selectedCategoryId(),
        this.searchTerm(),
        this.sortBy(),
        this.sortDescending(),
        this.isImportantFilter(),
      )
      .subscribe({
        next: (res: PagedResult<Assignment>) => {
          this.tasks.set(res.items);
          this.totalPages.set(res.totalPages);
        },
      });
  }

  onSidebarSelect(filter: { categoryId: number | null; important: boolean | null }) {
    this.searchTerm.set('');
    this.currentPage.set(1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: filter.categoryId,
        important: filter.important ? 'true' : null,
      },
    });
  }

  onCategoriesChanged() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res);

        const categoryExists = this.categories().some((c) => c.id === this.selectedCategoryId());

        if (!categoryExists && this.selectedCategoryId() !== null) {
          this.onSidebarSelect({ categoryId: null, important: null });
        } else {
          this.loadTasks();
        }
      },
    });
  }

  onFilterChange(filters: { term: string; by: string; desc: boolean; categoryId: number | null }) {
    this.searchTerm.set(filters.term);
    this.sortBy.set(filters.by);
    this.sortDescending.set(filters.desc);
    this.selectedCategoryId.set(filters.categoryId);
    this.loadTasks();
  }

  openTask(task: Assignment) {
    this.stepService.getByAssignmentId(task.id).subscribe({
      next: (steps) => this.openDialog(task, steps),
      error: () => this.openDialog(task, []),
    });
  }

  openNewTaskModal() {
    const cats = this.categories();
    const newTask: Assignment = {
      id: 0,
      title: '',
      description: '',
      categoryId: this.selectedCategoryId() || (cats.length > 0 ? cats[0].id : 0),
      userId: '',
      dueDate: new Date().toISOString().slice(0, 16),
      refreshType: null,
      isCompleted: false,
      isImportant: false,
      totalSteps: 0,
      completedSteps: 0,
    };
    this.openDialog(newTask, []);
  }

  private openDialog(task: Assignment, taskSteps: Step[]) {
    const dialogRef = this.dialog.open(AssignmentModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      data: { task, categories: this.categories(), taskSteps },
    });

    dialogRef.afterClosed().subscribe((result) => {
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
        isImportant: taskToSave.isImportant,
      };

      this.assignmentService.createAssignment(newTask).subscribe({
        next: () => this.loadTasks(),
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
        isImportant: taskToSave.isImportant,
      };

      this.assignmentService.updateAssignment(updatedTask).subscribe({
        next: () => this.loadTasks(),
      });
    }
  }

  deleteTask(taskId: number) {
    this.assignmentService.deleteAssignment(taskId).subscribe({
      next: () => this.loadTasks(),
    });
  }

  onToggleTaskCompletion(task: Assignment) {
    const originalStatus = task.isCompleted;

    const updatedTask: Assignment = {
      ...task,
      isCompleted: !task.isCompleted,
    };

    this.tasks.update((tasksArray) => tasksArray.map((t) => (t.id === task.id ? updatedTask : t)));

    const updateModel: UpdateAssignmentModel = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || '',
      categoryId: Number(updatedTask.categoryId),
      dueDate: updatedTask.dueDate,
      refreshType: updatedTask.refreshType,
      isCompleted: updatedTask.isCompleted,
      isImportant: updatedTask.isImportant,
    };

    this.assignmentService.updateAssignment(updateModel).subscribe({
      next: () => {
        if (updatedTask.isCompleted && updatedTask.refreshType !== null) {
          this.loadTasks();
        }
      },
      error: (err) => {
        this.tasks.update((tasksArray) =>
          tasksArray.map((t) => (t.id === task.id ? { ...t, isCompleted: originalStatus } : t)),
        );
      },
    });
  }
}

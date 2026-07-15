import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Assignment } from '../../core/models/assignment.model';
import { Category } from '../../core/models/category.model';
import { Step, CreateStepModel, UpdateStepModel } from '../../core/models/step.model';
import { StepService } from '../../core/services/step/stepService';
import { ChangeDetectorRef } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matEdit,
  matDelete,
  matCheck,
  matClose,
  matEvent,
} from '@ng-icons/material-icons/baseline';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { AssignmentService } from '../../core/services/assignment/assignmentService';

export interface AssignmentModalData {
  task: Assignment;
  categories: Category[];
  taskSteps: Step[];
}

@Component({
  selector: 'app-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, NgIconComponent],
  providers: [
    provideIcons({
      matCheck,
      matClose,
      matEdit,
      matDelete,
      matEvent,
    }),
  ],
  templateUrl: './assignment-modal.component.html',
})
export class AssignmentModalComponent {
  private stepService = inject(StepService);
  private cdr = inject(ChangeDetectorRef);
  private socialAuthService = inject(SocialAuthService);
  private assignmentService = inject(AssignmentService);

  editingStepId: number | null = null;
  editingStepTitle = '';

  task: Assignment;
  categories: Category[];
  taskSteps: Step[];
  newStepTitle = '';

  isAddingToCalendar = false;
  isRemovingFromCalendar = false;

  constructor(
    public dialogRef: MatDialogRef<AssignmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentModalData,
  ) {
    this.task = { ...data.task };
    this.categories = data.categories;
    this.taskSteps = [...data.taskSteps];
  }

  onSave() {
    this.dialogRef.close({ action: 'save', task: this.task });
  }

  addToGoogleCalendar() {
    if (!this.task || this.task.id === 0) {
      alert('Спочатку збережіть завдання в базу даних!');
      return;
    }

    this.isAddingToCalendar = true;

    this.socialAuthService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => {
        this.assignmentService.addToCalendar(this.task.id, accessToken).subscribe({
          next: () => {
            this.task.googleEventId = 'synced-locally';
            this.isAddingToCalendar = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Помилка бекенду:', err);
            alert('Не вдалося додати подію в календар.');
            this.isAddingToCalendar = false;
            this.cdr.detectChanges();
          },
        });
      })
      .catch((err) => {
        console.error('Помилка отримання токена Google:', err);
        this.isAddingToCalendar = false;
        this.cdr.detectChanges();
      });
  }

  removeFromGoogleCalendar() {
    if (!this.task || !this.task.googleEventId) return;

    this.isRemovingFromCalendar = true;
    this.cdr.detectChanges();

    this.socialAuthService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => {
        this.assignmentService.removeFromCalendar(this.task.id, accessToken).subscribe({
          next: () => {
            this.task.googleEventId = null;
            this.isRemovingFromCalendar = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Помилка бекенду:', err);
            alert('Не вдалося видалити подію з календаря.');
            this.isRemovingFromCalendar = false;
            this.cdr.detectChanges();
          },
        });
      })
      .catch((err) => {
        console.error('Помилка отримання токена Google:', err);
        this.isRemovingFromCalendar = false;
        this.cdr.detectChanges();
      });
  }

  onDelete() {
    if (confirm('Ви впевнені, що хочете видалити це завдання?')) {
      this.dialogRef.close({ action: 'delete', taskId: this.task.id });
    }
  }

  onAddStep() {
    if (!this.newStepTitle.trim() || !this.task.id) return;

    const newStep: CreateStepModel = {
      title: this.newStepTitle.trim(),
      assignmentId: this.task.id,
      isCompleted: false,
    };

    this.stepService.createStep(newStep).subscribe({
      next: () => {
        this.newStepTitle = '';
        this.reloadSteps();
      },
      error: (err) => console.error('Помилка додавання кроку:', err),
    });
  }

  startEditStep(step: Step) {
    this.editingStepId = step.id;
    this.editingStepTitle = step.title;
  }

  cancelEditStep() {
    this.editingStepId = null;
    this.editingStepTitle = '';
  }

  saveEditStep(step: Step) {
    if (!this.editingStepTitle.trim() || this.editingStepId === null) return;

    const updatedStep: UpdateStepModel = {
      id: step.id,
      title: this.editingStepTitle.trim(),
      assignmentId: step.assignmentId,
      isCompleted: step.isCompleted,
    };

    this.stepService.updateStep(updatedStep).subscribe({
      next: () => {
        this.editingStepId = null;
        step.title = updatedStep.title;
        this.reloadSteps();
      },
      error: (err) => console.error('Помилка оновлення кроку:', err),
    });
  }

  deleteStep(stepId: number) {
    this.stepService.deleteStep(stepId).subscribe({
      next: () => this.reloadSteps(),
      error: (err) => console.error(err),
    });
  }

  onToggleStep(step: Step) {
    const updatedStep: UpdateStepModel = {
      id: step.id,
      title: step.title,
      assignmentId: step.assignmentId,
      isCompleted: !step.isCompleted,
    };

    this.stepService.updateStep(updatedStep).subscribe({
      next: () => this.reloadSteps(),
      error: (err) => console.error('Помилка оновлення кроку:', err),
    });
  }

  private reloadSteps() {
    this.stepService.getByAssignmentId(this.task.id).subscribe({
      next: (steps) => {
        this.taskSteps = steps;
        this.cdr.detectChanges();
      },
    });
  }

  get currentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}

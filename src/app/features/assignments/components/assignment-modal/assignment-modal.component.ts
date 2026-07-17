import { Component, EventEmitter, Inject, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Assignment } from '../../../../core/models/assignment.model';
import { Category } from '../../../../core/models/category.model';
import { Step, CreateStepModel, UpdateStepModel } from '../../../../core/models/step.model';
import { StepService } from '../../../../core/services/step.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matEdit,
  matDelete,
  matCheck,
  matClose,
  matEvent,
} from '@ng-icons/material-icons/baseline';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { animate, sequence, style, transition, trigger } from '@angular/animations';

export interface AssignmentModalData {
  task: Assignment;
  categories: Category[];
  taskSteps: Step[];
  onStepChanged?: () => void;
}

@Component({
  selector: 'app-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, NgIconComponent],
  providers: [
    provideIcons({ matCheck, matClose, matEdit, matDelete, matEvent }),
  ],
  templateUrl: './assignment-modal.component.html',
  animations: [
    trigger('stepAnimation', [
      transition(':enter', sequence([
        style({ 
          opacity: 0, 
          height: '0px', 
          overflow: 'hidden',
          marginBottom: '0px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }),
        animate('200ms ease-out', style({ 
          opacity: 1, 
          height: '*', 
          marginBottom: '*',
          paddingTop: '*',
          paddingBottom: '*'
        }))
      ])),
      
      transition(':leave', sequence([
        style({ overflow: 'hidden' }),
        animate('200ms ease-in', style({ 
          opacity: 0, 
          height: '0px', 
          marginBottom: '0px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }))
      ]))
    ])
  ]
})
export class AssignmentModalComponent {
  private stepService = inject(StepService);
  private socialAuthService = inject(SocialAuthService);
  private assignmentService = inject(AssignmentService);

  editingStepId: number | null = null;
  editingStepTitle = '';

  task: Assignment;
  categories: Category[];
  newStepTitle = '';

  taskSteps = signal<Step[]>([]);
  isAddingToCalendar = signal(false);
  isRemovingFromCalendar = signal(false);
  @Output() taskUpdated = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<AssignmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentModalData,
  ) {
    this.task = { ...data.task };
    this.categories = data.categories;
    this.taskSteps.set([...data.taskSteps]);
  }

  onSave() {
    this.dialogRef.close({ action: 'save', task: this.task });
  }

  addToGoogleCalendar() {
    if (!this.task || this.task.id === 0) {
      alert('Спочатку збережіть завдання в базу даних!');
      return;
    }

    this.isAddingToCalendar.set(true);

    this.socialAuthService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => {
        this.assignmentService.addToCalendar(this.task.id, accessToken).subscribe({
          next: () => {
            this.task.googleEventId = 'synced-locally';
            this.isAddingToCalendar.set(false);
          },
          error: (err) => {
            this.isAddingToCalendar.set(false);
          },
        });
      })
      .catch((err) => {
        this.isAddingToCalendar.set(false);
      });
  }

  removeFromGoogleCalendar() {
    if (!this.task || !this.task.googleEventId) return;

    this.isRemovingFromCalendar.set(true);

    this.socialAuthService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => {
        this.assignmentService.removeFromCalendar(this.task.id, accessToken).subscribe({
          next: () => {
            this.task.googleEventId = null;
            this.isRemovingFromCalendar.set(false);
          },
          error: () => this.isRemovingFromCalendar.set(false)
        });
      })
      .catch(() => this.isRemovingFromCalendar.set(false)
      );
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
        this.reloadSteps();
      },
    });
  }

  deleteStep(stepId: number) {
    this.stepService.deleteStep(stepId).subscribe({
      next: () => this.reloadSteps(),
    });
  }

  onToggleStep(step: Step) {
    step.isCompleted = !step.isCompleted;

    const updatedStep: UpdateStepModel = {
      id: step.id,
      title: step.title,
      assignmentId: step.assignmentId,
      isCompleted: step.isCompleted, 
    };

    this.stepService.updateStep(updatedStep).subscribe({
      next: () => {
        const currentSteps = this.taskSteps();
        const completedCount = currentSteps.filter((s) => s.isCompleted).length;
        
        this.task.isCompleted = (completedCount === currentSteps.length);

        if (this.data.onStepChanged) {
          this.data.onStepChanged();
        }
      },
      error: () => {
        step.isCompleted = !step.isCompleted; 
      }
    });
  }

  private reloadSteps() {
    this.stepService.getByAssignmentId(this.task.id).subscribe({
      next: (steps) => {
        this.taskSteps.set(steps); 
        const completedCount = steps.filter(s => s.isCompleted).length;
        this.task.isCompleted = (steps.length > 0 && completedCount === steps.length);
        if (this.data.onStepChanged) {
          this.data.onStepChanged();
        }
      },
    });
  }

  get currentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}
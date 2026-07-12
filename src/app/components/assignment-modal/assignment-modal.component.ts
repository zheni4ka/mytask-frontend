import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Assignment } from '../../core/models/assignment.model';
import { Category } from '../../core/models/category.model';
import { Step, CreateStepModel, UpdateStepModel } from '../../core/models/step.model';
import { StepService } from '../../core/services/step/stepService';
import { ChangeDetectorRef } from '@angular/core';

export interface AssignmentModalData {
  task: Assignment;
  categories: Category[];
  taskSteps: Step[];
}

@Component({
  selector: 'app-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './assignment-modal.component.html'
})
export class AssignmentModalComponent {
  private stepService = inject(StepService);
  private cdr = inject(ChangeDetectorRef);

  
  
  task: Assignment;
  categories: Category[];
  taskSteps: Step[];
  newStepTitle = '';
  
  constructor(
    public dialogRef: MatDialogRef<AssignmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentModalData
  ) {
    this.task = { ...data.task };
    this.categories = data.categories;
    this.taskSteps = [...data.taskSteps];
  }

  onSave() {
    this.dialogRef.close({ action: 'save', task: this.task });
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
      isCompleted: false
    };

    this.stepService.createStep(newStep).subscribe({
      next: () => {
        this.newStepTitle = '';
        this.reloadSteps(); 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка додавання кроку:', err)
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
      next: () => { step.isCompleted = updatedStep.isCompleted; },
      error: (err) => console.error('Помилка оновлення кроку:', err)
    });
  }

  private reloadSteps() {
    this.stepService.getByAssignmentId(this.task.id).subscribe({
      next: (steps) => this.taskSteps = steps
    });
  }

  get currentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }


}
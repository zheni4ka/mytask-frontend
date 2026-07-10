import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Assignment } from '../core/models/assignment.model';
import { Category } from '../core/models/category.model';
import { Step } from '../core/models/step.model';

@Component({
  selector: 'app-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-modal.component.html'
})
export class AssignmentModalComponent {
  @Input({ required: true }) task!: Assignment;
  @Input() categories: Category[] = [];
  @Input() taskSteps: Step[] = [];

  
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveTask = new EventEmitter<Assignment>();
  @Output() deleteTask = new EventEmitter<number>();
  
  @Output() addStep = new EventEmitter<string>();
  @Output() toggleStep = new EventEmitter<Step>();

  newStepTitle = '';

  
  onSave() {
    this.saveTask.emit(this.task);
  }

  onDelete() {
    if (confirm('Ви впевнені, що хочете видалити це завдання?')) {
      this.deleteTask.emit(this.task.id);
    }
  }

  onAddStep() {
    if (!this.newStepTitle.trim()) return;
    this.addStep.emit(this.newStepTitle);
    this.newStepTitle = ''; 
  }
}
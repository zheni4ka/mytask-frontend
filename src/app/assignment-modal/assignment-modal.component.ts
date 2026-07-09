import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Assignment } from '../core/models/assignment.model';
import { Step } from '../core/models/step.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-modal.component.html' 
})
export class TaskModalComponent {
  @Input() task!: Assignment;
  @Input() steps: Step[] = [];
  @Input() isLoadingSteps = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() stepAdded = new EventEmitter<string>();
  @Output() stepToggled = new EventEmitter<Step>();

  newStepTitle = '';

  addStep() {
    if (!this.newStepTitle.trim()) return;
    this.stepAdded.emit(this.newStepTitle);
    this.newStepTitle = '';
  }

  toggleStep(step: Step) {
    this.stepToggled.emit(step);
  }
}
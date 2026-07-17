import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Assignment } from '../../../../core/models/assignment.model';
import { provideIcons, NgIconComponent } from '@ng-icons/core';
import { matLockClock, matCheck } from '@ng-icons/material-icons/baseline';
import { animate, sequence, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      matLockClock,
      matCheck,
    }),
  ],
  templateUrl: './assignment-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Assignment;
  @Output() toggleComplete = new EventEmitter<Assignment>();
  @Output() cardClick = new EventEmitter<Assignment>();

  private audio = `https://actions.google.com/sounds/v1/cartoon/pop.ogg`;

  onToggle(event: Event) {
    event.stopPropagation();

    if (!this.task.isCompleted) {
      const audio = new Audio(this.audio);
      audio.play();
    }

    this.toggleComplete.emit(this.task);
  }
}

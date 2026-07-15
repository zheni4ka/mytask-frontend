export enum RefreshType {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  userId: string;
  dueDate: string;
  refreshType: RefreshType | null;
  isCompleted: boolean;
  isImportant: boolean;
  totalSteps: number;
  completedSteps: number;
  googleEventId?: string | null;
}

export interface CreateAssignmentModel {
  title: string;
  description: string;
  categoryId: number;
  dueDate: string;
  refreshType: RefreshType | null;
  isCompleted: boolean;
  isImportant: boolean;
}

export interface UpdateAssignmentModel {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  dueDate: string;
  refreshType: RefreshType | null;
  isCompleted: boolean;
  isImportant: boolean;
}
export interface PagedResult<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  items: T[];
}

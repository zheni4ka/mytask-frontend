
export enum RefreshType {
  Daily = 0,
  Weekly = 1,
  Monthly = 2
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
}

export interface PagedResult<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  items: T[];
}

export interface CreateAssignmentModel {
  title: string;
  description: string;
  categoryId: number;
  dueDate: string;
  refreshType: RefreshType | null;
}

export interface UpdateAssignmentModel {
  title: string;
  description: string;
  categoryId: number;
  dueDate: string;
  refreshType: RefreshType | null;
  isCompleted: boolean;
}
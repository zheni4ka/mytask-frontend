export interface CreateStepModel 
{
    title: string;
    assignmentId: number;
    isCompleted: boolean;
}

export interface UpdateStepModel
{
    id: number;
    title: string;
    assignmentId: number;
    isCompleted: boolean;
}

export interface Step
{
    id: number;
    title: string;
    assignmentId: number;
    isCompleted: boolean;
}
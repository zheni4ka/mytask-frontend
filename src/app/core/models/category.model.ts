export interface Category
{
    id: number;
    name: string;
}

export interface CreateCategoryModel
{
    name: string;
}

export interface UpdateCategoryModel
{
    id: number;
    name: string;
}
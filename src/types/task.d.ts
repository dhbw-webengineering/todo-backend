export type TodoAPI = {
    id: number;
    userId: number;
    title: string;
    dueDate: string;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        userId: number;
        name: string;
    };
    description?: string;
    completedAt?: string | null;
    tags?: {
        id: number;
        name: string;
    }[];
};

export type Tag =
    {
        id: number;
        name: string;
    };
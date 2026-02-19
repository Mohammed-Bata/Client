import { ItemType, Priority } from "./Project";

export interface CreateWorkItemDto{
    title:string,
    description:string|null,
    projectcolumnid:number,
    assignedtouserid:string|null,
    assignedtousername:string|null,
    type: number;
    dueDate?: string | null;  
}

export interface ReorderWorkItemDto{
    workItemId: number;
    columnid: number;
    PrevOrder: number|null;
    NextOrder: number|null;
}

export interface ReorderResultDto{
    Order:number;
}

export interface WorkItemDto{
    id:number;
    title:string;
    description:string|null;
    assignedToUserId:string|null;
    assignedToUserName:string|null;
    authorUserId:string;
    authorUserName:string;
    type: ItemType;
    priority: Priority;
    dueDate?: string | null;
}

export interface UpdateWorkItemDto{
    title?:string|null;
    description?:string|null;
    assignedToUserId?:string|null;
    type?: ItemType|null;
    priority?: Priority|null;
    dueDate?: string|null;
}
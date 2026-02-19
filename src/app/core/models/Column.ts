import { WorkItemPreviewDto } from "./Project";



export interface CreateColumnDto{
    title:string,
    projectId:number
}

export interface ReorderColumnDto{
    columnId: number;
    PrevOrder: number|null;
    NextOrder: number|null;
}

export interface ReorderResultDto{
    Order:number;
}

export interface deleteColumnDto{
    columnId:number,
    targetColumnId:number|null,
    workitemIds:number[]|null
}

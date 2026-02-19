export interface CreateProjectDto{
    Name : string | null,
    Description: string | null
}

export interface GetProjectsDto{
    id:number |null,
    name:string |null,
    ownerId:string | null
}

export interface WorkItemPatchEvent{
  id:number,
  changes: Partial<WorkItemPreviewDto>;
}

export interface WorkItemPreviewDto {
  id: number;
  title: string;
  order: number;
  assignedToUserId?: string;
  assignedToUserName?: string;
  priority: Priority;
  dueDate?: string | null;  // DateOnly comes as string from API
  type: ItemType;
}

export enum Priority {
  Lowest = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  Highest = 5
}

export enum ItemType {
  Task = 1,
  Bug = 2,
  Feature = 3
}

export interface ProjectColumnDto {
  id: number;
  title: string;
  order: number;
  workItems: WorkItemPreviewDto[];
}

export interface ProjectDto {
  id: number;
  name: string;
  ownerId:string;
  columns: ProjectColumnDto[];
}
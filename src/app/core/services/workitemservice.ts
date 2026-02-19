import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { CreateWorkItemDto, ReorderResultDto, ReorderWorkItemDto, UpdateWorkItemDto, WorkItemDto } from "../models/WorkItem";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { catchError, Observable, Subject, tap } from "rxjs";
import { API_ENDPOINTS } from "../constants/api-endpoints";
import { WorkItemPatchEvent, WorkItemPreviewDto } from "../models/Project";




@Injectable({
  providedIn: 'root',
})

export class workitemservice{
  
    private readonly apiUrl = environment.apiUrl;

    private itemPatchSource = new Subject<WorkItemPatchEvent>();
    itemPatch$ = this.itemPatchSource.asObservable();

    constructor(private http:HttpClient){

    }

    broadcastPatch(id:number,changes:Partial<WorkItemPreviewDto>){
      this.itemPatchSource.next({id,changes});
    }



    updateWorkItem(id:number,dto:UpdateWorkItemDto):Observable<boolean>{
      return this.http.patch<boolean>(`${this.apiUrl}${API_ENDPOINTS.WORKITEMS.UPDATE}/${id}`,dto)
      .pipe(
        tap((response)=>console.log(response))
      );
    }

    getWorkItemById(id:number):Observable<WorkItemDto|any>{
      return this.http.get<WorkItemDto>(`${this.apiUrl}${API_ENDPOINTS.WORKITEMS.GETBYID}/${id}`)
      .pipe(
        tap((response)=>console.log(response)),
      );
    }

    reorderWorkItem(dto:ReorderWorkItemDto):Observable<ReorderResultDto|any>{
      return this.http.patch<ReorderResultDto>(`${this.apiUrl}${API_ENDPOINTS.WORKITEMS.REORDER}`,dto)
      .pipe(
        tap((response)=>console.log(response)),
      );
    }

    createWorkItem(dto:CreateWorkItemDto):Observable<number|any>{
        return this.http.post<number>(`${this.apiUrl}${API_ENDPOINTS.WORKITEMS.CREATE}`,dto)
        .pipe(
          tap((response)=>console.log(response)),
        );
    }

    deleteWorkItem(id:number):Observable<void|any>{
      return this.http.delete<void>(`${this.apiUrl}${API_ENDPOINTS.WORKITEMS.DELETE}/${id}`)
      .pipe(
        tap((response)=>console.log(response)),
      );
    }
}
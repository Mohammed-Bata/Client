import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { CreateColumnDto, deleteColumnDto, ReorderColumnDto, ReorderResultDto} from "../models/Column";
import { Observable, tap } from "rxjs";
import { API_ENDPOINTS } from "../constants/api-endpoints";
import { ProjectColumnDto } from "../models/Project";



@Injectable({ 
    providedIn: 'root'
})
export class ColumnService {
    private readonly apiUrl = environment.apiUrl;
    
    constructor(private http:HttpClient){

    }

    deleteColumn(deleteDto:deleteColumnDto):Observable<void|any>{
      return this.http.delete<void>(`${this.apiUrl}${API_ENDPOINTS.Column.DELETE}`,{
        body: deleteDto
      })
      .pipe(
        tap((response)=>console.log(response))
      );
    }

   

    createColumn(dto:CreateColumnDto):Observable<ProjectColumnDto|any>{
        return this.http.post<ProjectColumnDto>(`${this.apiUrl}${API_ENDPOINTS.Column.CREATE}`,dto)
        .pipe(
          tap((response)=>console.log(response))
        );
    }

    reorder(dto:ReorderColumnDto):Observable<ReorderResultDto|any>{
      return this.http.patch<ReorderResultDto>(`${this.apiUrl}${API_ENDPOINTS.Column.REORDER}`,dto)
      .pipe(
        tap((response)=>console.log(response))
      );
    }
}
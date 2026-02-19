import { Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINTS } from "../constants/api-endpoints";
import { CreateProjectDto, ProjectDto, GetProjectsDto } from "../models/Project";
import { catchError, EMPTY, empty, EmptyError, Observable, tap, throwError } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";




@Injectable({
  providedIn: 'root',
})

export class ProjectService{

  private _project = signal<ProjectDto | null>(null);
  project = this._project.asReadonly();

  private _projects = signal<GetProjectsDto[]>([]);
  projects = this._projects.asReadonly();

  private _loading = signal(true);
  loading = this._loading.asReadonly();


    private readonly apiUrl = environment.apiUrl;

    constructor(private http:HttpClient,private router: Router){

    }

    updateColumn(deletedId : number,targetId : number){
     this._project.update(current => {
      if (!current) return null;

      const deletedCol = current.columns.find(c => c.id === deletedId);
      const movedItems = deletedCol?.workItems || [];


      // 2. Map the columns
      const updatedColumns = current.columns
        .filter(col => col.id !== deletedId) // Remove the deleted one
        .map(col => {
          if (col.id === targetId) {
            // Push moved items into the target column's local array
    
            return { 
              ...col, 
              workItems: [...col.workItems, ...movedItems] 
            };
          }
          return col;
        });

      return { ...current, columns: updatedColumns };
      });
  }



    getProject(id:number):Observable<ProjectDto | any>{
      return this.http.get<ProjectDto>(`${this.apiUrl}${API_ENDPOINTS.PROJECT.GETPROJECT}/${id}`)
      .pipe(
        tap((response) => {
          this._project.set(response);
          this._loading.set(false);
        }),
        catchError((error) => {
          this._loading.set(false);
          this.router.navigate(['notfound'], { replaceUrl: true });
          return EMPTY;
        })
      );
    }

    getProjects():Observable<GetProjectsDto[]|any>{
      return this.http.get<GetProjectsDto[]>(`${this.apiUrl}${API_ENDPOINTS.PROJECT.GETALL}`)
      .pipe(
        tap((response)=>{
          this._projects.set(response);
          const isNotFound = this.router.url.includes('notfound');
          if(this.projects().length > 0 && !isNotFound){
            this.getProject(this.projects()[0]?.id!).subscribe({
              next: () =>this.router.navigate(['/project/',this.projects()[0]?.id])
            });
          }
          }), 
        catchError((error)=>this.handleError(error))
      );
    }

    createProject(dto : CreateProjectDto):Observable<GetProjectsDto | any> {
      return this.http.post<GetProjectsDto>(`${this.apiUrl}${API_ENDPOINTS.PROJECT.CREATE}`, dto)
      .pipe(
      tap((response) => {
        this._projects.update(projects => [...projects, response]);
      }),
      catchError((error) => this.handleError(error))
      );
    }

    deleteProject(id:number){
      return this.http.delete(`${this.apiUrl}${API_ENDPOINTS.PROJECT.DELETE}/${id}`)
      .pipe(
        tap((response) =>{ 
          this._projects.update(projects => projects.filter(p => p.id !== id));
         
        }),
        catchError((error) => this.handleError(error))
      )
    }

    private handleError(error:any):Observable<never>{
      const errMsg = error.error?.message || error.error;
      return throwError(() => errMsg);
    }
    
}
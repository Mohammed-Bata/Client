import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.prod";
import { AcceptDto, InvitationDto, InvitationResponse } from "../models/Team";
import { catchError, Observable, tap, throwError } from "rxjs";
import { API_ENDPOINTS } from "../constants/api-endpoints";




@Injectable({ 
    providedIn: 'root'
})

export class TeamService{

    private readonly apiUrl = environment.apiUrl;

    constructor(private http:HttpClient){}

    getTeamMembers(projectId:number):Observable<any>{
        return this.http.get(`${this.apiUrl}${API_ENDPOINTS.TeamMembers.GETALL}/${projectId}`)
        .pipe(
            catchError((error) => this.handleError(error))
        );
    }

    inviteMember(dto:InvitationDto):Observable<InvitationResponse|any>{
        return this.http.post<InvitationResponse>(`${this.apiUrl}${API_ENDPOINTS.TeamMembers.INVITE}`,dto)
        .pipe(
            catchError((error) => this.handleError(error))
        );
    }

    acceptInvite(dto:AcceptDto):Observable<InvitationResponse|any>{
        return this.http.post<InvitationResponse>(`${this.apiUrl}${API_ENDPOINTS.TeamMembers.ACCEPT}`,dto)
        .pipe(
            catchError((error)=>this.handleError(error))
        )
    }

    private handleError(error:any):Observable<never>{
        const errMsg = error.error?.message || error.error;
        return throwError(() => errMsg);
    }
}
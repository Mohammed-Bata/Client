import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from "rxjs";
import { API_ENDPOINTS } from "../constants/api-endpoints";
import { TokenService } from "./tokenservice";
import { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from "../models/Auth";
import { Router } from "@angular/router";
import { NotificationsService } from "./notificationsservice";








@Injectable({
  providedIn: 'root',
})

export class AuthService{

    private readonly apiUrl = environment.apiUrl;

    private isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null);
    public isAuthenticated$: Observable<boolean | null> = this.isAuthenticatedSubject.asObservable();

    constructor(private http:HttpClient,private tokenservice:TokenService,private notificationservice:NotificationsService,private router:Router){}

    get isAuthenticated(): boolean | null {
    return this.isAuthenticatedSubject.value;
    }

    setAuthenticated(value: boolean): void {
      this.isAuthenticatedSubject.next(value);
    }

    refresh(): Observable<TokenResponse|any> {
    return this.http
      .post<TokenResponse|any>(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response) => {
          this.tokenservice.setToken(response.accessToken);
          this.isAuthenticatedSubject.next(true);
          //start signalR 
          this.notificationservice.startConnection(response.accessToken);
          this.notificationservice.loadNotifications();
        }),
        catchError((error) => {

        // 🔥 refresh failed → auth is invalid
        this.isAuthenticatedSubject.next(false);
        this.tokenservice.clearToken();
        return of(null);
      }));

  }

 logout(): void {
   
    this.http
      .post(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,
        {},
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: () => {
          this.tokenservice.clearToken();
          this.isAuthenticatedSubject.next(false);
          this.notificationservice.stopConnection();
          console.log('✅ Logout successful');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('❌ Logout error:', error);
         
        },
      });
  }

    // Google OAuth login - redirect to backend
    loginWithGoogle(returnUrl:string|null) {

      if(returnUrl !== null){
        localStorage.setItem('returnUrl',returnUrl);
       
      }

      window.location.href = `${this.apiUrl}/Users/google/login`;
    }

    register(registerRequest:RegisterRequest):Observable<UserResponse>{
      return this.http.post<UserResponse>(`${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,registerRequest,{withCredentials:true})
      .pipe(
        tap((response)=>console.log(response))
      )
    }

    handleAuthSuccess(token:TokenResponse){
      this.tokenservice.setToken(token.accessToken);
      this.setAuthenticated(true);

      this.notificationservice.startConnection(token.accessToken);
      this.notificationservice.loadNotifications();
    }

    login(loginRequest:LoginRequest):Observable<TokenResponse>{
      return this.http.post<TokenResponse>(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,loginRequest, {
        withCredentials: true,
      }).pipe(
        tap((response)=>this.handleAuthSuccess(response))
      )
    }


    // Microsoft OAuth Login
    loginWithMicrosoft(returnUrl:string|null){

      if(returnUrl !== null){
        localStorage.setItem('returnUrl',returnUrl);
         }

      window.location.href = `${this.apiUrl}/Users/microsoft/login`;
    }

    // GitHub OAuth Login
    loginWithGitHub(returnUrl:string|null){

      if(returnUrl !== null){
        localStorage.setItem('returnUrl',returnUrl);
        }

      window.location.href = `${this.apiUrl}/Users/github/login`
    }

    handleOAuth(){

    }
}
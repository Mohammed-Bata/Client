import { inject } from "@angular/core";
import { TokenService } from "../services/tokenservice";
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../services/authservice";

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const tokenService = inject(TokenService);
 const authService = inject(AuthService);
 const accessToken = tokenService.getToken();


  if (req.url.includes('/Users/Login') || req.url.includes('/Users/Register') || req.url.includes('/Users/Refresh')) {
    return next(req);
  }

    let authRequest = req;

    if(accessToken){
      authRequest = addTokenToRequest(req,accessToken);
    }

    return next(authRequest).pipe(
      catchError((error:HttpErrorResponse)=>{
        let Message = 'An unexpected error occurred.';
        if(error.status === 401 && !req.url.includes('/Users/Refresh')){
          Message = 'Invalid credentials or session expired.';
          return handle401Error(req, next, tokenService, authService);
        }
        else if(error.status === 400){
          if (error.error?.errors) {
          const firstKey = Object.keys(error.error.errors)[0];
          Message = error.error.errors[firstKey][0];
        } 
        // CASE B: BadRequestException (Login) - Using the 'detail' field from ProblemDetails
        else if (error.error?.detail) {
          Message = error.error.detail;
        }
        }
        const customError = { ...error, Message };
        return throwError(() => customError);
      })
    );

};

function addTokenToRequest(request: any, accessToken: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  });
}

function handle401Error(
  request: HttpRequest<any>,
  next: any,
  tokenService: TokenService,
  authService: AuthService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Clear previous value

    return authService.refresh().pipe(
      switchMap((loginResponse) => {
        isRefreshing = false;
        
        const newToken = loginResponse.accessToken;
        tokenService.setToken(newToken);
        
        // 🚀 THE FIX: Notify all waiting requests that the new token is ready
        refreshTokenSubject.next(newToken);
        
        return next(addTokenToRequest(request, newToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.logout(); // Redirects to login and clears local storage
        return throwError(() => error);
      })
    );
  } else {
    // 🚦 Queueing: If a refresh is already in progress, wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next(addTokenToRequest(request, token!)))
    );
  }
}


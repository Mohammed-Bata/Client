import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth';
import { AuthService } from './core/services/authservice';
import { firstValueFrom } from 'rxjs';
import { TokenService } from './core/services/tokenservice';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(()=>{
      const authService = inject(AuthService);
     
      const wasLoggedIn = localStorage.getItem('wasLoggedIn') === 'true';

      if (!wasLoggedIn) {
        return Promise.resolve();
      }
      
      // The app will wait here until the refresh-token call finishes
      return firstValueFrom(authService.refresh());
    })
  ]
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/tokenservice';
import { catchError, map, of } from 'rxjs';
import { TeamService } from '../services/teamservice';

export const projectmemberGuard: CanActivateFn = (route, state) => {
  
  const tokenService = inject(TokenService);
  const teamService = inject(TeamService);
  const router = inject(Router);

  const projectId = Number(route.paramMap.get('id'));
  const currentUserId = tokenService.getUserId();

  if (!projectId || !currentUserId) {
    router.navigate(['/login']);
    return of(false);
  }

  return teamService.getTeamMembers(projectId).pipe(
    map((members:any[]) =>{
      const isMember = members.some(member => member.id === currentUserId);

      if (isMember) {
        return true;
      } else {
        console.warn('Access Denied');
        router.navigate(['/notfound']); 
        return false;
      }
    }),
    catchError((error) => {
      console.error('Guard Error:', error);
      router.navigate(['/notfound']);
      return of(false);
    })
  );

};

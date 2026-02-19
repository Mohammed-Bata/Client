import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Authcallback } from './features/auth/authcallback/authcallback';
import { Navbar } from './shared/components/navbar/navbar';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Project } from './features/project/project';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { AcceptInvite } from './features/accept-invite/accept-invite';
import { projectmemberGuard } from './core/guards/projectmember-guard';
import { Notfound } from './features/Errors/notfound/notfound';

export const routes: Routes = [
    {
        path:'login',
        component:Login
    },
    {
        path: 'oauth-callback',
        component:Authcallback
    },
    {
        path:'',
        component:MainLayout,
        children:[
            {
                path:'project/:id',
                component:Project,
                canActivate:[projectmemberGuard]
            },{
                path:'notfound',
                component:Notfound
            }
        ]
    },
    {
        path:'accept',
        component:AcceptInvite
    },
        { path: '**', redirectTo: 'notfound' }

];

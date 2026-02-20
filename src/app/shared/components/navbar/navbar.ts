import { Component, ElementRef, HostListener, inject, Signal, signal } from '@angular/core';
import { AuthService } from '../../../core/services/authservice';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NotificationsService } from '../../../core/services/notificationsservice';
import { Token } from '@angular/compiler';
import { TokenService } from '../../../core/services/tokenservice';
import { Router } from '@angular/router';
import { UIService } from '../../../core/services/uiservice';
import { AvatarColorPipe } from '../../pipes/avatar-color-pipe';
import { TimeagoPipe } from '../../pipes/timeago-pipe';
import { InitialsPipe } from '../../pipes/initials-pipe';

@Component({
  selector: 'app-navbar',
  imports: [AsyncPipe,AvatarColorPipe,TimeagoPipe,InitialsPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private eRef = inject(ElementRef);
  isAuthenticated$!: Observable<boolean | null>;
  isClicked = false;
  isAvatarClicked = false;
  user: Signal<{ id:string;name: string; email: string } | null>;
  openTheme = false;

  constructor(private router:Router,private authservice:AuthService,public notificationservice:NotificationsService,private tokenservice:TokenService,public uiservice:UIService){
    this.isAuthenticated$ = this.authservice.isAuthenticated$;
    this.user = this.tokenservice.user;
    this.notificationservice.getUnreadCount();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {

    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isClicked = false;
    this.isAvatarClicked = false;
    this.openTheme = false;
    }
  }


  markAll(){
    this.notificationservice.markAllAsRead().subscribe({
      next:() =>{
        console.log("done");
      }
    });
  }

  toggleSidebar(){
    this.uiservice.toggleSideBar();
  }

  toggle(){
    this.isClicked = !this.isClicked;
    this.isAvatarClicked = false;

    if(this.isClicked){
      this.notificationservice.loadNotifications();
    }
  }

  toggleAvatar(){
    this.isAvatarClicked = !this.isAvatarClicked;
    this.isClicked = false;
  }

  logout(){
    this.authservice.logout();
    this.isClicked = false;
    this.isAvatarClicked = false;
    this.router.navigate(['/login']);
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  gotoLogin(){
    this.router.navigate(['/login']);
  }

  setTheme(theme:string){
    this.uiservice.setTheme(theme);
  }
  
}

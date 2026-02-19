import { Component, OnInit } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../core/models/User';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development'
import { TokenService } from '../../../core/services/tokenservice';
import { AuthService } from '../../../core/services/authservice';

@Component({
  selector: 'app-authcallback',
  imports: [],
  templateUrl: './authcallback.html',
  styleUrl: './authcallback.scss',
})
export class Authcallback implements OnInit {
 

  constructor(private router:Router ,private tokenservice: TokenService,private authservice:AuthService
   ){
  }

  ngOnInit(): void {
    const hash = window.location.hash.slice(1); // remove #
    const params = new URLSearchParams(hash);
    const token = params.get('accesstoken');
  
    if (token) {
      this.tokenservice.setToken(token);
      this.authservice.setAuthenticated(true);

      console.log('token found');
    }

    // 5. Clean URL to remove token from fragment
    window.history.replaceState({}, document.title, '/login');

  const destination = localStorage.getItem('returnUrl') || null;

  console.log("oauthcallback",localStorage.getItem('returnUrl'));

  if(destination !== null){

    localStorage.removeItem('returnUrl'); 
    this.router.navigateByUrl(destination);
  }else{
    this.router.navigate(['/']);
  }


  }
}

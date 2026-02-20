import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TeamService } from '../../core/services/teamservice';
import { AuthService } from '../../core/services/authservice';

@Component({
  selector: 'app-accept-invite',
  imports: [RouterLink],
  templateUrl: './accept-invite.html',
  styleUrl: './accept-invite.scss',
})
export class AcceptInvite implements OnInit {

  token:string|null = null;
  isLoggedIn : boolean | null = false;
  loading = false;
  error:string | null = null;

  constructor(private router:Router,private route:ActivatedRoute,private teamservice:TeamService,private authservice:AuthService){}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      console.log('Token from Observable:', this.token);
    });
    

    console.log("Token initialized in Accept Component:", this.token);

    this.isLoggedIn = this.authservice.isAuthenticated;

    if(this.isLoggedIn && this.token){
      this.acceptInvite(this.token);
    }

   
  }

  acceptInvite(tokenSent:string){

    this.loading = true;


      const dto = {
        token : tokenSent
      }

      this.teamservice.acceptInvite(dto).subscribe({
        next:(response)=>{
          console.log(response.message);
          this.loading = false;
          this.router.navigate(['/']);
        },
        error:(err)=> {this.loading = false; console.log(err);this.error = "invitation error"}
      })

  }
}

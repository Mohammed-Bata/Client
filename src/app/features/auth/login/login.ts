import { Component } from '@angular/core';
import { FormBuilder, FormGroup, MinLengthValidator, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/authservice';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoginRequest, RegisterRequest } from '../../../core/models/Auth';
import { passwordLowerValidator } from '../../../core/validators/passwordLowerValidator';
import { passwordSpecialValidator } from '../../../core/validators/passwordSpecialValidator';
import { passwordUpperValidator } from '../../../core/validators/passwordUpperValidator';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  Form: FormGroup;
  page = "Login";
  errorMessage: string | null = null;


  constructor(private fb :FormBuilder,private authservice:AuthService,private route:ActivatedRoute,private router:Router){
    this.Form = this.fb.group({
      name:['',[Validators.minLength(3)]],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required]]
    })
  }

  togglePage(){
    const passwordControl = this.Form.get('password');
    this.page = this.page === 'Login' ? 'Register':'Login';

    if (this.page === 'Login') {
      this.Form.removeControl('name');
      passwordControl?.setValidators([Validators.required]);
    } else {
    this.Form.addControl('name', this.fb.control('', [Validators.required, Validators.minLength(3)]));
    passwordControl?.setValidators([passwordLowerValidator,passwordSpecialValidator,passwordUpperValidator,Validators.minLength(8)]);
    }

    passwordControl?.updateValueAndValidity();
  }


  handleForm():void{
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return;
    }

    this.Form.markAsUntouched();
    this.errorMessage = null;

    if(this.page === 'Login'){
      const loginRequest:LoginRequest = {
        email: this.Form.value.email,
        password: this.Form.value.password
      }

      this.authservice.login(loginRequest).subscribe({
      next:(response)=>{
        this.router.navigate(['/']);
      },
      error:(err)=>{
        this.errorMessage = err.Message;
      }
    })

    }else{
      const registerRequest:RegisterRequest = {
        name:this.Form.value.name,
        email: this.Form.value.email,
        password: this.Form.value.password
      }
      this.authservice.register(registerRequest).subscribe({
        next:(response)=>{
          this.page = 'Register';
        },
        error:(err)=>{
            this.errorMessage = err.Message;
        }
        });

      }
  }

  loginWithGoogle(){
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || null;

    console.log('logincomponent',returnUrl);

    this.authservice.loginWithGoogle(returnUrl);
  }
  loginWithMicrosoft(){
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || null;

    console.log('logincomponent',returnUrl);

    this.authservice.loginWithMicrosoft(returnUrl);
  }
  loginWithGitHub(){
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || null;

    console.log('logincomponent',returnUrl);

    this.authservice.loginWithGitHub(returnUrl);
  }
}

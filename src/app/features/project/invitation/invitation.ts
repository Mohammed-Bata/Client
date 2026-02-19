import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamService } from '../../../core/services/teamservice';
import { InvitationDto } from '../../../core/models/Team';

@Component({
  selector: 'app-invitation',
  imports: [ReactiveFormsModule],
  templateUrl: './invitation.html',
  styleUrl: './invitation.scss',
})
export class Invitation {

  invitationForm : FormGroup;
  @Input() projectId! : number;

  constructor(private fb:FormBuilder,private teamservice:TeamService){
    this.invitationForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]]
    });
  }

  handleForm(){
    if(this.invitationForm.invalid){
      this.invitationForm.markAllAsTouched();
      return;
    }

    const dto : InvitationDto = {
      email:this.invitationForm.value.email,
      projectid:this.projectId
    }

    this.teamservice.inviteMember(dto).subscribe({
      next:(value)=>console.log(value),
      error:(err)=>console.log(err.message)
    })

    this.invitationForm.markAsUntouched();
    
  }
}

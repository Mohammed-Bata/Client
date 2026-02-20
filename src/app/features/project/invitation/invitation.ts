import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamService } from '../../../core/services/teamservice';
import { InvitationDto } from '../../../core/models/Team';
import { OverlayRef } from '@angular/cdk/overlay';
import { PROJECT_ID } from '../project';

@Component({
  selector: 'app-invitation',
  imports: [ReactiveFormsModule],
  templateUrl: './invitation.html',
  styleUrl: './invitation.scss',
})
export class Invitation {

  invitationForm : FormGroup;

  constructor(private fb:FormBuilder,@Inject(PROJECT_ID) private projectId:number,private teamservice:TeamService,private overlayRef: OverlayRef){
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
      next:() =>{
        this.overlayRef?.detach();
        this.invitationForm.reset();
      },
      error:(err)=>console.log(err.message)
    })

    this.invitationForm.markAsUntouched();
    
  }
}

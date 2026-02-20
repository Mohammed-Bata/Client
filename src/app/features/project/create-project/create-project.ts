import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/projectservice';
import { TokenService } from '../../../core/services/tokenservice';
import { CreateProjectDto } from '../../../core/models/Project';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-create-project',
  imports: [ReactiveFormsModule],
  templateUrl: './create-project.html',
  styleUrl: './create-project.scss',
})
export class CreateProject {
  createProjectForm:FormGroup;

  constructor(private fb:FormBuilder,private projectservice:ProjectService,private overlayRef: OverlayRef){
    this.createProjectForm = this.fb.group({
      name:['',[Validators.required,Validators.minLength(3),Validators.maxLength(50)]],
      description:['',[Validators.required,Validators.minLength(5),Validators.maxLength(500)]]
    })
  }

  handleForm(){
    if (this.createProjectForm.invalid) {
      this.createProjectForm.markAllAsTouched();
      return;
    }


    const dto : CreateProjectDto = {
      Name : this.createProjectForm.value.name,
      Description: this.createProjectForm.value.description
    }


    this.projectservice.createProject(dto).subscribe({
      next:(value)=>{
        this.overlayRef?.detach();
        this.createProjectForm.reset();
      },
      error:(err)=>console.log(err.message)
    });

    this.createProjectForm.markAsUntouched();

  }


}

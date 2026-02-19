import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/projectservice';
import { ProjectColumnDto } from '../../../core/models/Project';
import { ColumnService } from '../../../core/services/columnservice';

@Component({
  selector: 'app-createcolumn',
  imports: [FormsModule],
  templateUrl: './createcolumn.html',
  styleUrl: './createcolumn.scss',
})
export class Createcolumn {
   title = '';
  @Input() projectId! : number;
  @Output() columncreated = new EventEmitter<ProjectColumnDto>();

  constructor(private columnservice: ColumnService){}

  createcolumn(){

    const dto = {
      title: this.title,
      projectId: this.projectId
    }

    this.columnservice.createColumn(dto).subscribe({
      next: (response)=>this.columncreated.emit(response),
      error: (error)=>{
        console.error('Error creating column:', error);
      }
    });
  }
}

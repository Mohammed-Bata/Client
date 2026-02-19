import { Component, computed, Inject, signal, Signal} from '@angular/core';
import { Column_Title } from '../column/column';
import { Column_Id } from '../column/column';
import { Column_WorkItems_Ids } from '../column/column';
import { DELETE_NOTIFIER } from '../column/column';
import { ProjectService } from '../../../core/services/projectservice';
import { OverlayRef } from '@angular/cdk/overlay';
import { deleteColumnDto } from '../../../core/models/Column';
import { ColumnService } from '../../../core/services/columnservice';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-delete-column',
  imports: [],
  templateUrl: './delete-column.html',
  styleUrl: './delete-column.scss',
})
export class DeleteColumn {

  openList = false;
  columnList : Signal<{id:number,title:string}[]>;
  selectedTarget = signal<{id:number,title:string} | null>(null);

  constructor(@Inject(Column_Title) public columnTitle: string,@Inject(Column_Id) public columnId:number,@Inject(Column_WorkItems_Ids) private workitemsIds:number[],
  private projectservice:ProjectService,private columnservice:ColumnService,private overlayRef: OverlayRef,
  @Inject(DELETE_NOTIFIER) private deleteNotifier:Subject<number>){
    this.columnList = computed(() => {
    // Access the readonly signal
    const currentProject = this.projectservice.project();

    if (!currentProject || !currentProject.columns) {
      return [];
    }

    // Filter out the column being deleted and map to id/title
    return currentProject.columns
      .filter(col => col.id !== this.columnId)
      .map(col => ({
        id: col.id,
        title: col.title
      }));
  });
  this.selectedTarget.set(this.columnList()[0]);
  }

  selectTarget(target:{id:number,title:string}){
    this.selectedTarget.set(target);
  }

  deleteColumn(){
    const dto :deleteColumnDto = {
      columnId:this.columnId,
      targetColumnId:this.selectedTarget()?.id!,
      workitemIds:this.workitemsIds
    }

    this.columnservice.deleteColumn(dto).subscribe({
      next:()=>{
        this.projectservice.updateColumn(this.columnId,this.selectedTarget()?.id!);
        this.deleteNotifier.next(dto.columnId);
        
      },
      error:(error)=>console.log(error)
    });
  }

  Cancel(){
    this.overlayRef.detach();
  }


}

import { Component, ElementRef, EventEmitter, HostListener, inject, InjectionToken, Injector, Input, Output, ViewChild } from '@angular/core';
import { ProjectColumnDto, WorkItemPatchEvent, WorkItemPreviewDto } from '../../../core/models/Project';
import { Workitem } from '../workitem/workitem';
import { workitemservice } from '../../../core/services/workitemservice';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ColumnService } from '../../../core/services/columnservice';
import { DateTime } from 'luxon';
import { CdkPortal, ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { Workitemdetails } from '../workitemdetails/workitemdetails';
import { AvatarColorPipe } from '../../../shared/pipes/avatar-color-pipe';
import { InitialsPipe } from '../../../shared/pipes/initials-pipe';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DeleteColumn } from '../delete-column/delete-column';
import { deleteColumnDto } from '../../../core/models/Column';
import { Subject } from 'rxjs';
import { TokenService } from '../../../core/services/tokenservice';

export const WORK_ITEM_ID = new InjectionToken<number>('WORK_ITEM_ID');
export const PROJECT_ID = new InjectionToken<number>('PROJECT_ID');
export const Column_Title = new InjectionToken<string>('Column_Title');
export const Column_Id = new InjectionToken<number>('Column_Id');
export const Column_WorkItems_Ids = new InjectionToken<number[]>('Column_WorkItems_Ids');
export const DELETE_NOTIFIER = new InjectionToken<Subject<number>>('DELETE_NOTIFIER');


@Component({
  selector: 'app-column',
  imports: [Workitem,CdkDrag,CdkDropList,DragDropModule,PortalModule,Workitemdetails,AvatarColorPipe,InitialsPipe,DeleteColumn],
  templateUrl: './column.html',
  styleUrl: './column.scss',
})

export class Column {
  private eRef = inject(ElementRef);
  @Input() column! :ProjectColumnDto;
  @Input() projectId!:number;
  @Input() ownerId!:string;
  @Input() connectedTo: string[] = [];
  @Output() columnDeleted = new EventEmitter<number>();
  create : boolean = false;
  openMenuWorkItemId: number | null = null;
  openMenuColumnId:number | null = null;
  @ViewChild(CdkPortal) portal!: CdkPortal;

  types = ['Task', 'Bug', 'Feature'];
  priorities = ['Lowest', 'Low', 'Medium', 'High', 'Highest'];


  constructor(private overlay : Overlay,private injector: Injector ,private workitemService: workitemservice,private columnService: ColumnService,private tokenservice:TokenService,private breakpointObserver: BreakpointObserver){
    this.workitemService.itemPatch$.subscribe(patch=>{
      this.applyPatchToLocalBoard(patch);
    })
  }

  showDelete(){
    return this.ownerId === this.tokenservice.getUserId();
  }

  @HostListener('document:keydown.escape')
onEscapePressed() {
  this.create = false;
  this.openMenuColumnId = null;
    this.openMenuWorkItemId = null;
}

   @HostListener('document:click', ['$event'])
  clickout(event: Event) {

   const target = event.target as HTMLElement;

  // 1. Close WorkItem Menu if clicking outside the specific work-item area
  // We check if the click was NOT inside an element with the class 'work-item'
  if (!target.closest('.head')) {
    this.openMenuWorkItemId = null;
  }

  // 2. Close Column Menu if clicking outside the column area
  if (!target.closest('.header')) { // Adjust class name to your column menu trigger
    this.openMenuColumnId = null;
  }
  
  // 3. Keep your existing logic for the global component if needed
  if (!this.eRef.nativeElement.contains(target)) {
    // Hard reset everything if clicking completely outside the navbar/board
    this.openMenuColumnId = null;
    this.openMenuWorkItemId = null;
    this.create = false;
  }
  }

  applyPatchToLocalBoard(patch: WorkItemPatchEvent){
    const item = this.column.workItems.find(i => i.id === patch.id);

    if(item){
      Object.assign(item, patch.changes);
    }
  }

  opencreate(){
    this.create = !this.create;
  }

  

  openWorkItemDetails(itemId:number){
    const isMobile =  window.innerWidth < 600;
     const config = new OverlayConfig({
      positionStrategy : this.overlay.position().global().centerHorizontally().centerVertically(),
      width: isMobile ? '100vw':'80%',
      height: isMobile ? '100vh':'80%',
      hasBackdrop: true,
    });

    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
    if (result.matches) {
      overlayRef.updateSize({ width: '100vw', height: '100vh' });
    } else {
      overlayRef.updateSize({ width: '80%', height: '80%' });
    }
  });

    const overlayRef = this.overlay.create(config);

    const customInjector = Injector.create({
    parent: this.injector,
    providers: [
      { provide: WORK_ITEM_ID, useValue: itemId },
      { provide:PROJECT_ID, useValue:this.projectId},
      { provide: OverlayRef, useValue: overlayRef }
    ]
    
    });
    const componentPortal = new ComponentPortal(Workitemdetails, null, customInjector);
    overlayRef.attach(componentPortal);

    //overlayRef.attach(this.portal);
    overlayRef.backdropClick().subscribe(()=> overlayRef.detach());
  }


formatDate(dateString: string): string {
  return DateTime
    .fromISO(dateString)
    .toFormat('LLL dd, yyyy');
}

  onWorkItemCreated(item:WorkItemPreviewDto){
    this.column.workItems.push(item);
    this.create = false;
  }

  openOptions(id:number){
    this.openMenuWorkItemId =
    this.openMenuWorkItemId === id ? null : id;
  }

  openColumnOptions(id:number){
    this.openMenuColumnId =
    this.openMenuColumnId === id ? null : id;
  }

  deleteColumn(columnId:number){
    const isMobile =  window.innerWidth < 600;
    if(this.column.workItems.length > 0){
      const config = new OverlayConfig({
      positionStrategy : this.overlay.position().global().centerHorizontally(),
      width: isMobile ? '100vw' : '70%',
      height: isMobile ? '50vh' : '50%',
      hasBackdrop: true,
    });

    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
    if (result.matches) {
      overlayRef.updateSize({ width: '100vw', height: '50vh' });
    } else {
      overlayRef.updateSize({ width: '70%', height: '50%' });
    }
    });

    const overlayRef = this.overlay.create(config);

    const deleteNotifier$ = new Subject<number>();

    // 2. Listen for the success signal
    deleteNotifier$.subscribe(() => {
     this.columnDeleted.emit(columnId);

      overlayRef.detach(); // Close the modal
    });


    const customInjector = Injector.create({
    parent: this.injector,
    providers: [
      { provide: Column_Title, useValue: this.column.title },
      {provide: Column_Id, useValue: this.column.id},
      {provide: Column_WorkItems_Ids, useValue:this.column.workItems.map(item =>item.id)},
      { provide: DELETE_NOTIFIER, useValue: deleteNotifier$ },
      { provide: OverlayRef, useValue: overlayRef }
    ]
    
    });
    const componentPortal = new ComponentPortal(DeleteColumn, null, customInjector);
    overlayRef.attach(componentPortal);

    //overlayRef.attach(this.portal);
    overlayRef.backdropClick().subscribe(()=> overlayRef.detach());
    }else{
      const dto : deleteColumnDto = {
        columnId:columnId,
        targetColumnId:null,
        workitemIds:null
      }

    this.columnService.deleteColumn(dto).subscribe({
      next:()=>{
        this.columnDeleted.emit(columnId);
      },
      error:(error)=>console.log(error)
    });
  }
  }

  deleteWorkItem(id:number){
    this.workitemService.deleteWorkItem(id).subscribe({
      next:()=>{
        this.column.workItems = this.column.workItems.filter(wi => wi.id !== id);
      },
      error:(error)=>console.log(error)
    });
  }

  onWorkItemReorder(event:CdkDragDrop<WorkItemPreviewDto[]>){

    if (event.previousContainer === event.container) {
    // Same column: just reorder
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }else{
      transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
      );
    }

    const targetList = event.container.data;
    const prevItem = targetList[event.currentIndex - 1];
    const nextItem = targetList[event.currentIndex + 1];

    const reorderDto = {
      workItemId: event.item.data.id,
      columnid: this.column.id,
      PrevOrder: prevItem ? prevItem.order : null,
      NextOrder: nextItem ? nextItem.order : null
    };

    this.workitemService.reorderWorkItem(reorderDto).subscribe({
      next:(response)=>{
        console.log('Reorder successful:', response);
        event.item.data.order = response.order;
      },
      error:(error)=>{
        console.error('Reorder failed:', error);
        if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
      } else {
        transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
      }
      }
    });
   
  }
}
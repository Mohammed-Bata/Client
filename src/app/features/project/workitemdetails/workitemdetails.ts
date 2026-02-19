import { Component, Inject, Input, OnInit, signal } from '@angular/core';
import { PROJECT_ID, WORK_ITEM_ID } from '../column/column';
import { workitemservice } from '../../../core/services/workitemservice';
import { OverlayRef } from '@angular/cdk/overlay';
import { ItemType, Priority } from '../../../core/models/Project';
import { UpdateWorkItemDto, WorkItemDto } from '../../../core/models/WorkItem';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models/User';
import { TeamService } from '../../../core/services/teamservice';
import { DateTime } from 'luxon';
import { Calendar } from '../../../shared/components/calendar/calendar';
import { AvatarColorPipe } from '../../../shared/pipes/avatar-color-pipe';
import { InitialsPipe } from '../../../shared/pipes/initials-pipe';

@Component({
  selector: 'app-workitemdetails',
  imports: [FormsModule,Calendar,AvatarColorPipe,InitialsPipe],
  templateUrl: './workitemdetails.html',
  styleUrl: './workitemdetails.scss',
})
export class Workitemdetails implements OnInit {
  item = signal<WorkItemDto|null>(null);
  loading = signal(true);
  teamMembers = signal<User[]>([]);
  description = '';
  openPriorityList = false;
  openTypeList = false;
  openAssigneeList = false;
  datepickerOpen = false;

  priorityList = [
    {value:1,label:'Lowest'},
    {value:2,label:'Low'},
    {value:3,label:'Medium'},
    {value:4,label:'High'},
    {value:5,label:'Highest'}
  ]

  typeList = [
    { value: 1, label: 'Task' },
    { value: 2, label: 'Bug' },
    { value: 3, label: 'Feature'}
  ]

  constructor(@Inject(WORK_ITEM_ID) public itemId: number,@Inject(PROJECT_ID) public projectId:number,private overlayRef: OverlayRef,
    private workItemService: workitemservice,private teamService:TeamService) {}

  ngOnInit(): void {
    this.workItemService.getWorkItemById(this.itemId).subscribe({
      next: (data) => {
        this.item.set(data);
        this.loading.set(false);
        this.description = data.description ?? '';
      },
      error: (error) => {
        console.error('Error fetching work item details:', error);
        this.loading.set(false);
      }
    });
  }

  formatDate(date:string | null){
    if(!date){
      return '';
    }
    return DateTime.fromISO(date).toFormat('LLL dd, yyyy');
  }

  onDaySelected(day: any) {
    
    this.updateProperty('dueDate',day.toISODate())

    this.datepickerOpen = false;
  }

  selectAssignee(id:string){
    const member = this.teamMembers().find(m => m.id === id);
    if (!member) return;

    this.openAssigneeList = false;

    this.updateProperty('assignedToUserId',id);

    this.item.update(current=>({
      ...current,assignedToUserName:member.name
    } as WorkItemDto));

    this.workItemService.broadcastPatch(this.item()!.id,{
      assignedToUserId:member.id,
      assignedToUserName:member.name
    } as any);

  }

  toggleAssigned() {
    if(!this.openAssigneeList&&this.teamMembers().length===0){
      //fetch team members
      this.teamService.getTeamMembers(this.projectId).subscribe({
        next:(response)=>{
          this.teamMembers.set(response);
          console.log("fetched team members:");
          console.log(response);
        },
        error:(error)=>console.log(error)
      });
    }
    console.log(this.openAssigneeList);
    this.openAssigneeList = !this.openAssigneeList;
  }

  selectPriority(option: { label: string, value: number }){

    this.openPriorityList = false;

    this.updateProperty('priority', option.value);
  }

  selectType(option:{ label: string, value: number }){
    this.openTypeList = false;

    this.updateProperty('type',option.value);
  }

  updateProperty(propertyName: keyof UpdateWorkItemDto, value: any){
    const id = this.item()!.id;
    
    // Create a DTO with ONLY the changed property
    const patchDto: UpdateWorkItemDto = {
      [propertyName]: value
    };

    this.workItemService.updateWorkItem(id,patchDto).subscribe({
      next: (success) => {
        if (success) {
          // Update the local signal so the UI stays in sync
          this.item.update(current => ({ ...current, [propertyName]: value }as WorkItemDto));
          console.log(`${propertyName} updated successfully!`);

          const cardFields: string[] = ['title', 'priority', 'type', 'dueDate', 'assignedToUserId', 'assignedToUserName'];
          if(cardFields.includes(propertyName)){
            this.workItemService.broadcastPatch(id,patchDto as any);
          }

        }},
        error: (err) => console.error('Patch failed', err)
    });
  }

  getPriorityName(priority: Priority): string {
   return Priority[priority];
  }
  getTypeName(type: ItemType): string {
    return ItemType[type];
  }

  close() {
    this.overlayRef.detach(); // This closes the portal
  }

}

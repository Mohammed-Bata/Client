import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Component, HostListener, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { CreateProject } from '../../../features/project/create-project/create-project';
import { ProjectService } from '../../../core/services/projectservice';
import { GetProjectsDto, ProjectDto } from '../../../core/models/Project';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { icons } from '../../icons/icons';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TokenService } from '../../../core/services/tokenservice';

@Component({
  selector: 'app-sidebar',
  imports: [DragDropModule,PortalModule,CreateProject,RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  protected defaultWidth = 300;
  protected currentWidth = signal(this.defaultWidth);
  open = signal(false);
  @ViewChild(CdkPortal) portal!: CdkPortal;
  projects : Signal<GetProjectsDto[]>;
  loading = signal(true);
  selectedProject!: Signal<ProjectDto | null>;
  Menu = false;
  openMenuProjectId: number | null = null;


  constructor(private overlay : Overlay,private projectservice:ProjectService,private tokenservice:TokenService,private router:Router,private breakpointObserver: BreakpointObserver){
    this.selectedProject = this.projectservice.project;
    this.projects = this.projectservice.projects;
  }

  ngOnInit():void{
    this.projectservice.getProjects().subscribe({
      next:dtos =>{
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    })
  }

  showDelete(ownerid:string){
    return this.tokenservice.getUserId() === ownerid;
  }

  openModel(event:MouseEvent){
    event.stopPropagation();
    const isMobile =  window.innerWidth < 600;
    const config = new OverlayConfig({
      positionStrategy : this.overlay.position().global().centerHorizontally().centerVertically(),
      width:isMobile ? '100vw':'60%',
      height:isMobile ? '60vh':'50%',
      hasBackdrop: true
    });

    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
    if (result.matches) {
      overlayRef.updateSize({ width: '100vw', height: '60vh' });
    } else {
      overlayRef.updateSize({ width: '60%', height: '50%' });
    }});

    const overlayRef = this.overlay.create(config);
    overlayRef.attach(this.portal);
    overlayRef.backdropClick().subscribe(()=> overlayRef.detach());
  }

  protected onDragMoved(event : CdkDragMove){
    this.currentWidth.set(event.pointerPosition.x);

    const element = event.source.element.nativeElement;

    element.style.transform = 'none';
  }


  toggle() {
    this.open.update(v => !v);
    console.log(this.open());
  }

  getProjectIcon(projectId:number):string{
    return icons[projectId % icons.length];
  }

  openMenu(projectId:number,event:MouseEvent){
    event.stopPropagation();
    this.Menu = !this.Menu
    this.openMenuProjectId =
    this.openMenuProjectId === projectId ? null : projectId;
  }

  @HostListener('document:click')
  closeMenu() {
    this.openMenuProjectId = null;
  }

  deleteProject(projectId:number){
    
    this.projectservice.deleteProject(projectId).subscribe({
      next:()=>{
          if (this.selectedProject() && this.selectedProject()!.id === projectId) {
            this.router.navigate(['/']);
          }
      },
      error:(error) => console.error('Error deleting project:', error)
    });
  }
}

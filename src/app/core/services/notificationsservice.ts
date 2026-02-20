import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { BehaviorSubject, filter, from, switchMap, take, tap } from "rxjs";
import { NotificationDto, UnreadCount } from "../models/Notification";
import { API_ENDPOINTS } from "../constants/api-endpoints";
import * as signalR from '@microsoft/signalr';
import { HttpClient } from "@angular/common/http";
import { TokenService } from "./tokenservice";


@Injectable({ 
    providedIn: 'root'
})

export class NotificationsService{
    private readonly apiUrl = environment.apiUrl;
    private hubConnection!: signalR.HubConnection;

    private notificationsSubject = new BehaviorSubject<NotificationDto[]>([])
    public notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    private connectionState$ = new BehaviorSubject<boolean>(false);

    constructor(private http:HttpClient,private tokenservice:TokenService){}

    markAllAsRead(){
        return this.http.patch(`${this.apiUrl}${API_ENDPOINTS.Notification.MARKALLREAD}`,{}).pipe(
            tap(()=>{
                this.unreadCountSubject.next(0);
            })
        );
    }

    getUnreadCount():void{
        this.http.get<UnreadCount>(`${this.apiUrl}${API_ENDPOINTS.Notification.UNREADCOUNT}`).subscribe({
            next:(response)=>this.unreadCountSubject.next(response.unread)
        })
    }

    loadNotifications(): void{
        if(this.notificationsSubject.value.length > 0){
            return;
        }
        console.log('getting');
        this.http.get<NotificationDto[]>(`${this.apiUrl}${API_ENDPOINTS.Notification.GETALL}`,{params:{
            Status:'all'
        },withCredentials:true}).subscribe({
            next:(notifications)=>{
                this.notificationsSubject.next(notifications);
            }
        })
    }

    startConnection(token:string){
        this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('https://jira-clone.runasp.net/notifications',{
            accessTokenFactory:()=>token 
        })
        .withAutomaticReconnect()
        .build();

        // this.hubConnection.start()
        // .then(() => console.log('SignalR: Connected with JWT via Query String'))
        // .catch(err => console.error('SignalR Connection Error: ', err));

        // this.getUnreadCount();

        from(this.hubConnection.start()).subscribe({
        next: () => {
            console.log('SignalR: Connected');
            this.connectionState$.next(true);
        },
        error: (err) => console.error('SignalR Connection Error:', err)
        });

        this.hubConnection.on('ReceiveNotification', (notification: any) => {

            const currentUserId = this.tokenservice.getUserId();

            if (notification.actorId === currentUserId) {
                console.log('Action performed by me, skipping notification UI update.');
                return; 
            }

            const current = this.notificationsSubject.value;
            this.notificationsSubject.next([notification, ...current]);

            const count = this.unreadCountSubject.value;
            this.unreadCountSubject.next(count + 1);
        });
    }

    joinProjectGroup(projectId:string){
        this.connectionState$.pipe(
            filter(connected => connected),  // wait until true
        take(1),                         // only once
        switchMap(() => from(this.hubConnection.invoke('JoinProject', projectId)))
        ).subscribe({
            next:() => console.log(`Joined group: Project_${projectId}`),
            error: (err) => console.error('Join Group Error:', err)
        })
    }

    leaveProjectGroup(projectId:string){
       this.connectionState$.pipe(
        filter(connected => connected),
        take(1),
        switchMap(()=>from(this.hubConnection.invoke('LeaveProject',projectId)))
       ).subscribe({
        next:() => console.log(`Leave group: Project_${projectId}`),
        error:(err)=> console.error('Leave Group Error:',err)
       })
    }
}
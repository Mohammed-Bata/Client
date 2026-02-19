import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { BehaviorSubject, tap } from "rxjs";
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
        .withUrl('https://localhost:7144/notifications',{
            accessTokenFactory:()=>token 
        })
        .withAutomaticReconnect()
        .build();

        this.hubConnection.start()
        .then(() => console.log('SignalR: Connected with JWT via Query String'))
        .catch(err => console.error('SignalR Connection Error: ', err));

        this.getUnreadCount();

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
        if(this.hubConnection?.state === signalR.HubConnectionState.Connected){
            this.hubConnection.invoke('JoinProject', projectId)
            .then(() => console.log(`Joined group: Project_${projectId}`))
            .catch(err => console.error('Join Group Error:', err));
        }
    }

    leaveProjectGroup(projectId:string){
        if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
            this.hubConnection.invoke('LeaveProject', projectId)
            .catch(err => console.error('Leave Group Error:', err));
        }
    }
}
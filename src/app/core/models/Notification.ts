export interface NotificationDto{
    id:number,
    message:string,
    actorId:string,
    actorName:string,
    createdAt:string,
    isread:boolean
}

export interface UnreadCount{
    unread:number
}
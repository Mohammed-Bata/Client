
export interface InvitationDto{
    email:string,
    projectid:number
}

export interface InvitationResponse{
    message:string;
}

export interface AcceptDto{
    token:string;
}
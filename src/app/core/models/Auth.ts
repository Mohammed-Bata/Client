
export interface TokenResponse {
  accessToken: string; 
}

export interface UserResponse{
  name:string,
  email:string
}

export interface LoginRequest{
  email:string,
  password:string
}

export interface RegisterRequest{
  name:string,
  email:string,
  password:string
}
export interface GenerateOtpRequest {
  username: string;
}

export interface ValidateOtpRequest {
  username: string;
  um_otp: number;
}

export interface ApiResponse<T = unknown> {
  response?: string;
  message?: string;
  data?: T;
  modelData?: T;
  advData?: T;
}

export interface User {
  um_id?: number;
  username?: string;
  um_username?: string;
  um_name?: string;
  um_mobile?: string;
  um_email?: string;
  um_rec_status?: number;
}

export interface AuthUser {
  username: string;
  name?: string;
  userId?: number;
}
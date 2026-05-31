export type AuthMode = "login" | "register";

export interface LoginFormData {
  phone: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

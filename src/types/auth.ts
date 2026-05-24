import type { CustomerType } from "./user";

export type AuthMode = "login" | "register";

export interface LoginFormData {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  customerType: CustomerType;
  city: string;
  acceptTerms: boolean;
}

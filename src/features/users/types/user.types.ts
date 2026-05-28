export type CustomerType = "Particular" | "Empresa" | "Condominio" | "Industria";

export type ContactMethod = "WhatsApp" | "Telefone" | "Email";

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  customerType: CustomerType;
  city: string;
  status: "Conta ativa" | "Conta pendente";
  verified: boolean;
  preferredContactMethod: ContactMethod;
  interests: string[];
}

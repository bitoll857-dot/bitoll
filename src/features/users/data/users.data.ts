import type { User } from "~/types/user";

export const users: User[] = [
  {
    id: 1,
    name: "Bitoll User",
    email: "usuario@bitoll.co.mz",
    phone: "+258 84 000 0000",
    avatarUrl: "",
    customerType: "Particular",
    city: "Maputo",
    status: "Conta ativa",
    verified: true,
    preferredContactMethod: "WhatsApp",
    interests: ["CCTV", "Vedacao eletrica", "Motores de portao"],
  },
];

export const isAuthenticated = true;

export const currentUser = isAuthenticated ? users[0] : null;

export const currentSession = isAuthenticated
  ? {
      provider: "Google",
      startedAt: "2026-05-27T08:15:00+02:00",
    }
  : null;

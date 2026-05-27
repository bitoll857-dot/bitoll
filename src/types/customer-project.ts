export type ProjectStatus =
  | "Solicitado"
  | "Em avaliacao"
  | "Em instalacao"
  | "Em testes"
  | "Concluido";

export interface CustomerProject {
  id: string;
  title: string;
  service: string;
  location: string;
  requestedAt: string;
  status: ProjectStatus;
  progress: number;
  nextStep: string;
  technician: string;
  estimatedCompletion: string;
  updates: string[];
}


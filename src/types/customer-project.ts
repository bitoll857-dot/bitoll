export type ProjectStatus =
  | "Em processamento"
  | "Em actividade"
  | "Reclamacao"
  | "Recusado"
  | "Finalizado";

export interface CustomerProject {
  id: string;
  quoteNumber: string;
  title: string;
  service: string;
  location: string;
  requestedAt: string;
  activityStartAt: string;
  activityEndAt: string;
  status: ProjectStatus;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  structureCost: number;
  structureCostPercentage: number;
  progress: number;
  progressEnabled?: boolean;
  nextStep: string;
  technician: string;
  estimatedCompletion: string;
  receiptNumber: string;
  receiptUrl: string;
  procedureSteps: {
    checked: boolean;
    day: number;
    label: string;
  }[];
  updates: string[];
  items: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
}

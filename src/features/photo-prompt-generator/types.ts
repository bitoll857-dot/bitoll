export type PhotoPromptIdentity = {
  code: string;
  currentPassword: string;
  newPassword: string;
  password: string;
};

export type PhotoPromptAccessMode = "login" | "create" | "recover" | "reset";

export type PhotoPromptAccessForm = {
  countryDialCode: string;
  generatedPassword: string;
  message: string;
  newPassword: string;
  password: string;
  recoveryCode: string;
  sentCode: string;
  whatsapp: string;
};

export type PhotoPromptUserAccount = {
  createdAt: string;
  password: string;
  recoveryCode?: string;
  whatsapp: string;
};

export type PhotoPromptForm = {
  addElements: string;
  aspectRatio: string;
  background: string;
  childSubject: boolean;
  clothingColor: string;
  clothingStyle: string;
  clothingType: string;
  extraDetails: string;
  finalStyle: string;
  groupComposition: string;
  hair: string;
  hairType: string;
  keepItems: string[];
  lighting: string;
  negativePrompt: boolean;
  objective: string;
  observations: string;
  photoType: string;
  preserveBody: boolean;
  preserveIdentity: boolean;
  problems: string[];
  removeElements: string;
  shoes: string;
  styleReference: string;
  textOnImageContent: string;
  textOnImage: string;
};

export type PromptHistoryItem = {
  createdAt: string;
  id: string;
  objective: string;
  photoType: string;
  prompt: string;
};

export type QuickPromptModel = {
  label: string;
  objective: string;
  photoType: string;
  problems: string[];
  style: string;
};

export type PhotoPromptRequestItem = {
  admin_response: string;
  coins_charged: number;
  created_at: string;
  edited_image_url: string;
  id: string;
  image_name: string;
  objective: string;
  photo_type: string;
  responded_at: string | null;
  status: string;
  whatsapp: string;
};

export type PhotoPromptWalletTransfer = {
  admin_note: string;
  amount: number;
  coins: number;
  created_at: string;
  id: string;
  method: PhotoPromptWalletMethod;
  status: "pendente" | "aprovado" | "retido";
  transfer_reference: string;
  updated_at: string;
  whatsapp: string;
};

export type PhotoPromptWalletMethod = "E-Mola" | "mKesh" | "M-Pesa";

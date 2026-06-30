import type {
  PhotoPromptIdentity,
  PhotoPromptWalletMethod,
  PhotoPromptUserAccount,
} from "./types";

export const identityKey = "bitoll-photo-prompt-identity";
export const historyKey = "bitoll-photo-prompt-history";
export const sessionKey = "bitoll-photo-prompt-session";
export const usersKey = "bitoll-photo-prompt-users";

export const whatsappCountryCodes = [
  { code: "+258", label: "Mocambique (+258)" },
  { code: "+244", label: "Angola (+244)" },
  { code: "+351", label: "Portugal (+351)" },
  { code: "+55", label: "Brasil (+55)" },
  { code: "+27", label: "Africa do Sul (+27)" },
  { code: "+1", label: "Estados Unidos (+1)" },
];

export const createClientCode = () =>
  `BTP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString()
    .slice(-4)}`;

export const createClientPassword = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

export const createRecoveryCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const normalizeWhatsapp = (value: string, countryDialCode = "+258") => {
  const cleanValue = value.replace(/[^\d+]/g, "").trim();
  const cleanCountryCode = countryDialCode.replace(/[^\d+]/g, "").trim();

  if (!cleanValue) {
    return "";
  }

  if (cleanValue.startsWith("+")) {
    return `+${cleanValue.replace(/[^\d]/g, "")}`;
  }

  if (cleanValue.startsWith("00")) {
    return `+${cleanValue.slice(2).replace(/\D/g, "")}`;
  }

  const digits = cleanValue.replace(/\D/g, "");
  const countryDigits = cleanCountryCode.replace(/\D/g, "");

  if (countryDigits && digits.startsWith(countryDigits)) {
    return `+${digits}`;
  }

  return `${cleanCountryCode}${digits.replace(/^0+/, "")}`;
};

export const adminWhatsappForForeignWallet = "00258866136316";

export const detectMozambiqueWalletMethod = (
  whatsapp: string,
): {
  error?: string;
  method?: PhotoPromptWalletMethod;
  prefix?: string;
} => {
  const normalizedWhatsapp = normalizeWhatsapp(whatsapp);

  if (!normalizedWhatsapp.startsWith("+258")) {
    return {
      error: `Nao e possivel efectuar a operacao com prefixo estrangeiro. Contacte pelo WhatsApp o admin ${adminWhatsappForForeignWallet}.`,
    };
  }

  const localNumber = normalizedWhatsapp.replace("+258", "").replace(/^0+/, "");
  const prefix = localNumber.slice(0, 2);

  if (["86", "87", "88"].includes(prefix)) {
    return { method: "E-Mola", prefix };
  }

  if (["82", "83"].includes(prefix)) {
    return { method: "mKesh", prefix };
  }

  if (["84", "85"].includes(prefix)) {
    return { method: "M-Pesa", prefix };
  }

  return {
    error: `Nao foi possivel reconhecer a carteira pelo prefixo ${prefix || "do numero"}. Contacte pelo WhatsApp o admin ${adminWhatsappForForeignWallet}.`,
    prefix,
  };
};

export const savePhotoPromptIdentity = (identity: PhotoPromptIdentity) => {
  localStorage.setItem(
    identityKey,
    JSON.stringify({
      code: identity.code,
      password: identity.password,
    }),
  );
};

export const loadPhotoPromptIdentity = () => {
  try {
    return JSON.parse(
      localStorage.getItem(identityKey) || "{}",
    ) as Partial<PhotoPromptIdentity>;
  } catch {
    return {};
  }
};

export const loadPhotoPromptUsers = () =>
  JSON.parse(
    localStorage.getItem(usersKey) || "{}",
  ) as Record<string, PhotoPromptUserAccount>;

export const savePhotoPromptUsers = (
  users: Record<string, PhotoPromptUserAccount>,
) => {
  localStorage.setItem(usersKey, JSON.stringify(users));
};

export const savePhotoPromptSession = (whatsapp: string) => {
  localStorage.setItem(sessionKey, whatsapp);
};

export const clearPhotoPromptSession = () => {
  localStorage.removeItem(sessionKey);
  localStorage.removeItem(identityKey);
};

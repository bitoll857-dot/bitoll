import { getSupabaseBrowserClient } from "~/lib/supabase/client";
import type {
  PhotoPromptForm,
  PhotoPromptRequestItem,
  PhotoPromptWalletMethod,
  PhotoPromptWalletTransfer,
} from "./types";

type AccountResult = {
  error?: string;
  ok: boolean;
  whatsapp?: string;
};

const databaseUnavailableMessage =
  "Nao foi possivel ligar a base de dados. Verifique a internet e tente novamente.";

const operationErrorMessage = (fallback: string, message?: string) =>
  message ? `${fallback} Detalhe: ${message}` : fallback;

const firstWhatsapp = (data: unknown) => {
  if (!Array.isArray(data)) {
    return "";
  }

  const first = data[0] as { whatsapp?: string } | undefined;

  return first?.whatsapp || "";
};

export const createPhotoPromptAccount = async (
  whatsapp: string,
  password: string,
): Promise<AccountResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc("create_photo_prompt_account", {
    password_input: password,
    whatsapp_input: whatsapp,
  });

  if (error) {
    return {
      error: operationErrorMessage(
        "Nao foi possivel criar o acesso.",
        error.message,
      ),
      ok: false,
    };
  }

  return { ok: true, whatsapp: firstWhatsapp(data) };
};

export const loginPhotoPromptAccount = async (
  whatsapp: string,
  password: string,
): Promise<AccountResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc("login_photo_prompt_account", {
    password_input: password,
    whatsapp_input: whatsapp,
  });

  const matchedWhatsapp = firstWhatsapp(data);

  if (error) {
    return {
      error: operationErrorMessage(
        "Nao foi possivel confirmar o acesso.",
        error.message,
      ),
      ok: false,
    };
  }

  if (!matchedWhatsapp) {
    return { error: "ID ou senha invalida.", ok: false };
  }

  return { ok: true, whatsapp: matchedWhatsapp };
};

export const verifyPhotoPromptSession = async (
  whatsapp: string,
  password: string,
): Promise<AccountResult> => {
  if (!whatsapp || !password) {
    return { error: "Sessao incompleta. Entre novamente.", ok: false };
  }

  return loginPhotoPromptAccount(whatsapp, password);
};

export const requestPhotoPromptRecovery = async (
  whatsapp: string,
  recoveryCode: string,
): Promise<AccountResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc("request_photo_prompt_recovery", {
    recovery_code_input: recoveryCode,
    whatsapp_input: whatsapp,
  });

  const matchedWhatsapp = firstWhatsapp(data);

  if (error) {
    return {
      error: operationErrorMessage(
        "Nao foi possivel pedir a reposicao de senha.",
        error.message,
      ),
      ok: false,
    };
  }

  if (!matchedWhatsapp) {
    return { error: "Este WhatsApp nao tem acesso criado.", ok: false };
  }

  return { ok: true, whatsapp: matchedWhatsapp };
};

export const resetPhotoPromptPassword = async (
  whatsapp: string,
  recoveryCode: string,
  password: string,
): Promise<AccountResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc("reset_photo_prompt_password", {
    password_input: password,
    recovery_code_input: recoveryCode,
    whatsapp_input: whatsapp,
  });

  const matchedWhatsapp = firstWhatsapp(data);

  if (error) {
    return {
      error: operationErrorMessage(
        "Nao foi possivel alterar a senha.",
        error.message,
      ),
      ok: false,
    };
  }

  if (!matchedWhatsapp) {
    return { error: "Codigo invalido ou expirado.", ok: false };
  }

  return { ok: true, whatsapp: matchedWhatsapp };
};

export const changePhotoPromptPassword = async (
  whatsapp: string,
  currentPassword: string,
  newPassword: string,
): Promise<AccountResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc("change_photo_prompt_password", {
    current_password_input: currentPassword,
    new_password_input: newPassword,
    whatsapp_input: whatsapp,
  });

  const matchedWhatsapp = firstWhatsapp(data);

  if (error) {
    return {
      error: operationErrorMessage(
        "Nao foi possivel alterar a senha.",
        error.message,
      ),
      ok: false,
    };
  }

  if (!matchedWhatsapp) {
    return { error: "Senha atual invalida.", ok: false };
  }

  return { ok: true, whatsapp: matchedWhatsapp };
};

export const loadCurrentProfilePhone = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return "";
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (!userId) {
    return "";
  }

  const { data } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", userId)
    .maybeSingle();

  return typeof data?.phone === "string" ? data.phone : "";
};

export const submitPhotoPromptRequest = async (
  whatsapp: string,
  password: string,
  form: PhotoPromptForm,
  prompt: string,
  imageName = "",
  coinsCharged = 0,
): Promise<{ error?: string; id?: string; ok: boolean }> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc("create_photo_prompt_request", {
    form_payload_input: form,
    image_name_input: imageName,
    image_url_input: "",
    coins_charged_input: coinsCharged,
    password_input: password,
    prompt_input: prompt,
    whatsapp_input: whatsapp,
  });

  const first = Array.isArray(data)
    ? (data[0] as { id?: string } | undefined)
    : undefined;

  if (error || !first?.id) {
    return {
      error: operationErrorMessage(
        "Nao foi possivel enviar o pedido.",
        error?.message,
      ),
      ok: false,
    };
  }

  return { id: first.id, ok: true };
};

export const listPhotoPromptRequests = async (
  whatsapp: string,
  password: string,
  isAdmin: boolean,
): Promise<{ error?: string; items: PhotoPromptRequestItem[]; ok: boolean }> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, items: [], ok: false };
  }

  if (isAdmin) {
    const { data, error } = await supabase
      .from("photo_prompt_requests")
      .select(
        "id,whatsapp,status,photo_type,objective,image_name,admin_response,edited_image_url,coins_charged,created_at,responded_at",
      )
      .order("created_at", { ascending: false })
      .limit(150);

    return {
      error: error?.message,
      items: (data ?? []) as PhotoPromptRequestItem[],
      ok: !error,
    };
  }

  const { data, error } = await supabase.rpc("list_photo_prompt_requests", {
    password_input: password,
    whatsapp_input: whatsapp,
  });

  return {
    error: error?.message,
    items: (data ?? []) as PhotoPromptRequestItem[],
    ok: !error,
  };
};

export const updatePhotoPromptRequestResponse = async (
  requestId: string,
  response: string,
  editedImageUrl: string,
  coinsCharged: number,
): Promise<{ error?: string; ok: boolean }> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { error } = await supabase
    .from("photo_prompt_requests")
    .update({
      admin_response: response.trim(),
      coins_charged: Math.max(0, Math.floor(coinsCharged || 0)),
      edited_image_url: editedImageUrl.trim(),
      responded_at: new Date().toISOString(),
      status: "respondido",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  return { error: error?.message, ok: !error };
};

export const listPhotoPromptWalletTransfers = async (
  whatsapp: string,
  password: string,
  isAdmin: boolean,
): Promise<{
  error?: string;
  items: PhotoPromptWalletTransfer[];
  ok: boolean;
}> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, items: [], ok: false };
  }

  if (isAdmin) {
    const { data, error } = await supabase
      .from("photo_prompt_wallet_transfers")
      .select(
        "id,whatsapp,method,transfer_reference,amount,coins,status,admin_note,created_at,updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(150);

    return {
      error: error?.message,
      items: (data ?? []) as PhotoPromptWalletTransfer[],
      ok: !error,
    };
  }

  const { data, error } = await supabase.rpc(
    "list_photo_prompt_wallet_transfers",
    {
      password_input: password,
      whatsapp_input: whatsapp,
    },
  );

  return {
    error: error?.message,
    items: (data ?? []) as PhotoPromptWalletTransfer[],
    ok: !error,
  };
};

export const submitPhotoPromptWalletTransfer = async (
  whatsapp: string,
  password: string,
  method: PhotoPromptWalletMethod,
  transferReference: string,
  amount: number,
  coins: number,
): Promise<{ error?: string; id?: string; ok: boolean }> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { data, error } = await supabase.rpc(
    "create_photo_prompt_wallet_transfer",
    {
      amount_input: amount,
      coins_input: coins,
      method_input: method,
      password_input: password,
      transfer_reference_input: transferReference,
      whatsapp_input: whatsapp,
    },
  );
  const first = Array.isArray(data)
    ? (data[0] as { id?: string } | undefined)
    : undefined;
  const errorDetails = error
    ? [error.message, error.details, error.hint, error.code]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return {
    error: errorDetails,
    id: first?.id,
    ok: !error && Boolean(first?.id),
  };
};

export const updatePhotoPromptWalletTransferStatus = async (
  transferId: string,
  status: PhotoPromptWalletTransfer["status"],
  adminNote: string,
): Promise<{ error?: string; ok: boolean }> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: databaseUnavailableMessage, ok: false };
  }

  const { error } = await supabase
    .from("photo_prompt_wallet_transfers")
    .update({
      admin_note: adminNote.trim(),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transferId);

  return { error: error?.message, ok: !error };
};

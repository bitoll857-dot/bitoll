import type { Session } from "@supabase/supabase-js";

import {
  clearAuthIntent,
  getAuthRedirectUrl,
  getSupabaseBrowserClient,
  hasAuthIntent,
  isSupabaseConfigured,
  markAuthIntent,
  markLocalAuthSession,
} from "./client";

import type { User } from "~/types/user";

type AuthActionResult = {
  hasSession?: boolean;
  message: string;
  ok: boolean;
};

const missingConfigResult: AuthActionResult = {
  ok: false,
  message:
    "A base de dados da Bitoll ainda nao esta configurada. Preencha PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY.",
};

const getErrorMessage = (message?: string) =>
  message || "Nao foi possivel completar a autenticacao agora.";

const getProfileFromSession = async (
  session: Session | null,
): Promise<Partial<User> | null> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !session?.user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, avatar_url, customer_type, city, preferred_contact_method, status, verified",
    )
    .eq("id", session.user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    customerType: data.customer_type,
    city: data.city,
    preferredContactMethod: data.preferred_contact_method,
    status: data.status,
    verified: data.verified,
  };
};

const completeAuth = async (session: Session | null, message: string) => {
  const profile = await getProfileFromSession(session);

  markLocalAuthSession(session, profile);

  return {
    hasSession: !!session,
    message,
    ok: true,
  };
};

export const hasSupabaseAuthConfig = () => isSupabaseConfigured();

export const signInWithGoogle = async (): Promise<AuthActionResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return missingConfigResult;
  }

  markAuthIntent();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        prompt: "select_account",
      },
      redirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    clearAuthIntent();
    return { ok: false, message: getErrorMessage(error.message) };
  }

  return {
    message: "A redirecionar para a conta Google.",
    ok: true,
  };
};

export const signInWithPassword = async (
  phone: string,
  password: string,
): Promise<AuthActionResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return missingConfigResult;
  }

  const { data: profile, error: profileError } = await supabase.rpc(
    "get_login_email_by_phone",
    { phone_identifier: phone },
  );

  if (profileError || !profile) {
    return {
      ok: false,
      message: "Nao encontramos uma conta com esse telefone.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(profile),
    password,
  });

  if (error) {
    return { ok: false, message: getErrorMessage(error.message) };
  }

  return completeAuth(data.session, "Sessao iniciada na base de dados da Bitoll.");
};

export const signUpWithPassword = async (input: {
  email?: string;
  name: string;
  password: string;
  phone: string;
}): Promise<AuthActionResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return missingConfigResult;
  }

  const { data: existingLoginEmail, error: phoneLookupError } =
    await supabase.rpc("get_login_email_by_phone", {
      phone_identifier: input.phone,
    });

  if (!phoneLookupError && existingLoginEmail) {
    return {
      ok: false,
      message: "Este telefone ja esta ligado a uma conta. Entre com telefone e palavra-passe.",
    };
  }

  const response = await fetch("/api/auth/register", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = (await response.json().catch(() => null)) as {
    message?: string;
    ok?: boolean;
  } | null;

  if (!response.ok || !result?.ok) {
    return {
      ok: false,
      message: result?.message ?? "Nao foi possivel criar a conta agora.",
    };
  }

  const loginResult = await signInWithPassword(input.phone, input.password);

  if (!loginResult.ok) {
    return {
      ok: true,
      message: "Conta criada. Ja pode entrar com telefone e palavra-passe.",
    };
  }

  return {
    ...loginResult,
    message: "Conta criada e sessao iniciada.",
  };
};

export const exchangeSupabaseAuthCode = async (
  code: string,
): Promise<AuthActionResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return missingConfigResult;
  }

  if (!hasAuthIntent()) {
    await supabase.auth.signOut();
    markLocalAuthSession(null);

    return {
      hasSession: false,
      message: "Esta tentativa de login ja expirou. Inicie sessao novamente.",
      ok: false,
    };
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { ok: false, message: getErrorMessage(error.message) };
  }

  clearAuthIntent();

  return completeAuth(data.session, "Sessao confirmada na base de dados da Bitoll.");
};

export const syncSupabaseAuthSession = async (): Promise<AuthActionResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return missingConfigResult;
  }

  if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/auth/callback") &&
    !hasAuthIntent()
  ) {
    await supabase.auth.signOut();
    markLocalAuthSession(null);
    return {
      hasSession: false,
      message: "Esta tentativa de login ja expirou. Inicie sessao novamente.",
      ok: false,
    };
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { ok: false, message: getErrorMessage(error.message) };
  }

  clearAuthIntent();

  return completeAuth(data.session, "Sessao sincronizada.");
};

export const signOutFromSupabase = async (): Promise<AuthActionResult> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    markLocalAuthSession(null);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
    return { ok: true, message: "Sessao local terminada." };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { ok: false, message: getErrorMessage(error.message) };
  }

  markLocalAuthSession(null);

  if (typeof window !== "undefined") {
    window.location.replace("/");
  }

  return { ok: true, message: "Sessao terminada." };
};

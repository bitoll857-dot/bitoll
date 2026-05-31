import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "@builder.io/qwik-city";

import { getPhoneLoginEmail } from "~/lib/auth/phone-login";

type RegisterPayload = {
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
};

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const onPost: RequestHandler = async ({ env, json, request }) => {
  const payload = (await request.json().catch(() => null)) as RegisterPayload | null;
  const name = getString(payload?.name);
  const phone = getString(payload?.phone);
  const contactEmail = getString(payload?.email);
  const password = getString(payload?.password);

  if (!name || !phone || !password) {
    json(400, {
      message: "Preencha nome, telefone e palavra-passe.",
      ok: false,
    });
    return;
  }

  const supabaseUrl = env.get("PUBLIC_SUPABASE_URL") ?? "";
  const serviceRoleKey =
    env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    env.get("SUPABASE_SERVICE_KEY") ??
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    json(500, {
      message:
        "A criacao de conta sem email precisa da chave SUPABASE_SERVICE_ROLE_KEY configurada no servidor.",
      ok: false,
    });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const loginEmail = getPhoneLoginEmail(phone);
  const { data: existingLoginEmail } = await supabase.rpc(
    "get_login_email_by_phone",
    { phone_identifier: phone },
  );

  if (existingLoginEmail) {
    json(409, {
      message:
        "Este telefone ja esta ligado a uma conta. Entre com telefone e palavra-passe.",
      ok: false,
    });
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email: loginEmail,
    email_confirm: true,
    password,
    user_metadata: {
      contact_email: contactEmail,
      customer_type: "Particular",
      full_name: name,
      phone,
      preferred_contact_method: "WhatsApp",
      uses_phone_login_email: true,
    },
  });

  if (error) {
    const message = error.message.toLowerCase().includes("already")
      ? "Este telefone ja esta ligado a uma conta. Entre com telefone e palavra-passe."
      : "Nao foi possivel criar a conta agora. Tente novamente.";

    json(400, { message, ok: false });
    return;
  }

  json(200, {
    message: "Conta criada. Ja pode entrar com telefone e palavra-passe.",
    ok: true,
  });
};

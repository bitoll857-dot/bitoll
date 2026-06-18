import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "@builder.io/qwik-city";

import { getPhoneLoginEmail, normalizePhoneForLogin } from "~/lib/auth/phone-login";

type CustomerAccessPayload = {
  city?: string;
  email?: string;
  name?: string;
  phone?: string;
  quoteId?: string;
};

const temporaryPassword = "123456";

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const onPost: RequestHandler = async ({ env, json, request, url }) => {
  const payload = (await request.json().catch(() => null)) as
    | CustomerAccessPayload
    | null;
  const quoteId = getString(payload?.quoteId);
  const name = getString(payload?.name) || "Cliente Bitoll";
  const phone = getString(payload?.phone);
  const email = getString(payload?.email);
  const city = getString(payload?.city);
  const username = normalizePhoneForLogin(phone);

  if (!quoteId || !username) {
    json(400, {
      message: "Informe a solicitacao e o contacto do cliente.",
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
        "A criacao do acesso do cliente precisa da chave SUPABASE_SERVICE_ROLE_KEY configurada no servidor.",
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
  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!bearer) {
    json(401, { message: "Sessao administrativa expirada.", ok: false });
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(bearer);

  if (authError || !authData.user) {
    json(401, { message: "Sessao administrativa invalida.", ok: false });
    return;
  }

  const { data: adminAccess } = await supabase
    .from("admin_users")
    .select("role,active")
    .eq("user_id", authData.user.id)
    .eq("active", true)
    .maybeSingle();

  if (!adminAccess?.role) {
    json(403, { message: "Sem permissao para criar acesso de cliente.", ok: false });
    return;
  }

  const loginEmail = getPhoneLoginEmail(phone);
  const { data: quote } = await supabase
    .from("quotes")
    .select("id,profile_id,request_payload")
    .eq("id", quoteId)
    .maybeSingle();
  let customerId = typeof quote?.profile_id === "string" ? quote.profile_id : "";

  if (!customerId) {
    const { data: profileByPhone } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    customerId = profileByPhone?.id ?? "";
  }

  if (!customerId) {
    const { data: createdUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: loginEmail,
        email_confirm: true,
        password: temporaryPassword,
        user_metadata: {
          city,
          contact_email: email,
          customer_type: "Particular",
          full_name: name,
          must_change_password: true,
          phone,
          preferred_contact_method: "WhatsApp",
          uses_phone_login_email: true,
        },
      });

    if (createError || !createdUser.user) {
      json(400, {
        message:
          createError?.message || "Nao foi possivel criar o acesso do cliente.",
        ok: false,
      });
      return;
    }

    customerId = createdUser.user.id;
  } else {
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      customerId,
      {
        password: temporaryPassword,
        user_metadata: {
          city,
          contact_email: email,
          full_name: name,
          must_change_password: true,
          phone,
          preferred_contact_method: "WhatsApp",
          uses_phone_login_email: true,
        },
      },
    );

    if (updateAuthError) {
      json(400, {
        message:
          updateAuthError.message ||
          "Nao foi possivel preparar a senha temporaria.",
        ok: false,
      });
      return;
    }

    await supabase
      .from("profiles")
      .update({
        city,
        email,
        full_name: name,
        must_change_password: true,
        phone,
        preferred_contact_method: "WhatsApp",
        temporary_password_set_at: new Date().toISOString(),
      })
      .eq("id", customerId);
  }

  const requestPayload =
    quote?.request_payload && typeof quote.request_payload === "object"
      ? (quote.request_payload as Record<string, unknown>)
      : {};
  const trackingUrl = new URL("/profile", url.origin).toString();

  await supabase
    .from("quotes")
    .update({
      profile_id: customerId,
      request_payload: {
        ...requestPayload,
        client_access: {
          must_change_password: true,
          prepared_at: new Date().toISOString(),
          tracking_url: trackingUrl,
          username,
        },
      },
    })
    .eq("id", quoteId);

  json(200, {
    customerId,
    mustChangePassword: true,
    ok: true,
    temporaryPassword,
    trackingUrl,
    username,
  });
};

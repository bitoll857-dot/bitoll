import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "@builder.io/qwik-city";

type ComplaintPayload = {
  message?: string;
  quoteId?: string;
};

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const onPost: RequestHandler = async ({ env, json, request }) => {
  const payload = (await request.json().catch(() => null)) as
    | ComplaintPayload
    | null;
  const quoteId = getString(payload?.quoteId);
  const message = getString(payload?.message);

  if (!quoteId || !message) {
    json(400, {
      message: "Informe a solicitacao e o motivo da reclamacao.",
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
        "A reclamacao precisa da chave SUPABASE_SERVICE_ROLE_KEY configurada no servidor.",
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
    json(401, { message: "Sessao expirada.", ok: false });
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(bearer);

  if (authError || !authData.user) {
    json(401, { message: "Sessao invalida.", ok: false });
    return;
  }

  const { data: quote } = await supabase
    .from("quotes")
    .select("id,profile_id,request_payload,updates,progress")
    .eq("id", quoteId)
    .eq("profile_id", authData.user.id)
    .maybeSingle();

  if (!quote) {
    json(404, {
      message: "Nao encontramos esta solicitacao na sua conta.",
      ok: false,
    });
    return;
  }

  const requestPayload =
    quote.request_payload && typeof quote.request_payload === "object"
      ? (quote.request_payload as Record<string, unknown>)
      : {};
  const previousComplaints = Array.isArray(requestPayload.complaints)
    ? requestPayload.complaints
    : [];
  const updates = Array.isArray(quote.updates)
    ? quote.updates.filter((item): item is string => typeof item === "string")
    : [];

  const { error } = await supabase
    .from("quotes")
    .update({
      next_step: "Reclamacao aberta para analise da Bitoll.",
      progress: Math.min(99, Math.max(5, Number(quote.progress ?? 0))),
      request_payload: {
        ...requestPayload,
        complaints: [
          ...previousComplaints,
          {
            author: "cliente",
            createdAt: new Date().toISOString(),
            message,
          },
        ],
      },
      status: "reclamacao",
      updated_at: new Date().toISOString(),
      updates: [...updates, `Reclamacao do cliente: ${message}`],
    })
    .eq("id", quoteId)
    .eq("profile_id", authData.user.id);

  if (error) {
    json(400, {
      message: error.message || "Nao foi possivel guardar a reclamacao.",
      ok: false,
    });
    return;
  }

  json(200, {
    message: "Reclamacao registada.",
    ok: true,
  });
};

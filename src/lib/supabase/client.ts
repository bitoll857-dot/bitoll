import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

import type { User } from "~/types/user";

const normalizeSupabaseUrl = (url: string) =>
  url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseUrl = normalizeSupabaseUrl(
  import.meta.env.PUBLIC_SUPABASE_URL ?? "",
);
const supabaseAnonKey =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";
const publicSiteUrl =
  import.meta.env.PUBLIC_SITE_URL ??
  import.meta.env.PUBLIC_APP_URL ??
  import.meta.env.PUBLIC_BASE_URL ??
  "";

let browserClient: SupabaseClient | null = null;

const authStateKey = "bitoll-auth-state";
const authUserKey = "bitoll-auth-user";
const authIntentKey = "bitoll-auth-intent";
const authStartedAtKey = "bitoll-auth-started-at";
const adminAccessKey = "bitoll-admin-access";

export const isSupabaseConfigured = () =>
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes("your-project-ref") &&
  !supabaseAnonKey.includes("your-supabase-anon-key");

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, "");

const isLocalOrigin = (origin: string) => {
  try {
    const { hostname } = new URL(origin);

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
};

const getConfiguredSiteOrigin = () => {
  const origin = normalizeOrigin(publicSiteUrl);

  if (!origin) {
    return "";
  }

  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
};

export const getSupabaseBrowserClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        persistSession: true,
      },
    });
  }

  return browserClient;
};

export const getAuthRedirectUrl = () => {
  const configuredOrigin = getConfiguredSiteOrigin();

  if (typeof window === "undefined") {
    return configuredOrigin
      ? `${configuredOrigin}/auth/callback`
      : "/auth/callback";
  }

  const runtimeOrigin = window.location.origin;

  if (isLocalOrigin(runtimeOrigin)) {
    return `${runtimeOrigin}/auth/callback`;
  }

  if (configuredOrigin && !isLocalOrigin(configuredOrigin)) {
    return `${configuredOrigin}/auth/callback`;
  }

  return `${runtimeOrigin}/auth/callback`;
};

const getStringMetadata = (
  metadata: Record<string, unknown> | undefined,
  keys: string[],
) => {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

export const sessionToUser = (
  session: Session | null,
  profile?: Partial<User> | null,
): User | null => {
  if (!session?.user) {
    return null;
  }

  const metadata = session.user.user_metadata;
  const fullName =
    profile?.name ||
    getStringMetadata(metadata, ["full_name", "name"]) ||
    session.user.email ||
    "Cliente Bitoll";

  return {
    id: profile?.id ?? session.user.id,
    name: fullName,
    email: profile?.email || session.user.email || "",
    phone: profile?.phone || getStringMetadata(metadata, ["phone"]),
    avatarUrl:
      profile?.avatarUrl || getStringMetadata(metadata, ["avatar_url", "picture"]),
    customerType: profile?.customerType || "Particular",
    city: profile?.city || getStringMetadata(metadata, ["city"]),
    status: profile?.status || "Conta ativa",
    verified:
      profile?.verified ??
      (!!session.user.email_confirmed_at ||
        session.user.app_metadata.provider === "google"),
    preferredContactMethod: profile?.preferredContactMethod || "WhatsApp",
    interests: profile?.interests || [],
  };
};

export const getCachedAuthUser = (): User | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(authUserKey);

    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
};

export const markAuthIntent = () => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(authIntentKey, "google");
  }
};

export const hasAuthIntent = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(authIntentKey) === "google";
};

export const clearAuthIntent = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(authIntentKey);
  }
};

export const markLocalAuthSession = (
  session: Session | null,
  profile?: Partial<User> | null,
) => {
  if (typeof window === "undefined") {
    return;
  }

  const user = sessionToUser(session, profile);

  if (session) {
    window.localStorage.setItem(authStateKey, "authenticated");
    window.localStorage.setItem(
      authStartedAtKey,
      window.localStorage.getItem(authStartedAtKey) ?? new Date().toISOString(),
    );

    if (user) {
      window.localStorage.setItem(authUserKey, JSON.stringify(user));
    }
  } else {
    window.localStorage.setItem(authStateKey, "guest");
    window.localStorage.removeItem(authUserKey);
    window.localStorage.removeItem(authStartedAtKey);
    window.localStorage.removeItem(adminAccessKey);
    clearAuthIntent();
  }

  window.dispatchEvent(
    new CustomEvent("bitoll-auth-change", {
      detail: { isAuthenticated: !!session, user },
    }),
  );
};

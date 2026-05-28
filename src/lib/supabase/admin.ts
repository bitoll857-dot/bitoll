import { getCachedAuthUser, getSupabaseBrowserClient } from "./client";

export type AdminAccess = {
  isAdmin: boolean;
  role: "admin" | "operador" | "owner" | null;
};

const adminAccessKey = "bitoll-admin-access";

export const getCachedAdminAccess = (): AdminAccess => {
  if (typeof window === "undefined") {
    return { isAdmin: false, role: null };
  }

  try {
    const rawAccess = window.localStorage.getItem(adminAccessKey);

    return rawAccess
      ? (JSON.parse(rawAccess) as AdminAccess)
      : { isAdmin: false, role: null };
  } catch {
    return { isAdmin: false, role: null };
  }
};

export const clearCachedAdminAccess = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(adminAccessKey);
  }
};

export const loadAdminAccess = async (): Promise<AdminAccess> => {
  const supabase = getSupabaseBrowserClient();
  const user = getCachedAuthUser();

  if (!supabase || !user) {
    clearCachedAdminAccess();
    return { isAdmin: false, role: null };
  }

  const { data, error } = await supabase.rpc("get_admin_access");

  const role = Array.isArray(data) ? data[0]?.role : null;
  const access: AdminAccess =
    error || !role
      ? { isAdmin: false, role: null }
      : { isAdmin: true, role };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(adminAccessKey, JSON.stringify(access));
  }

  return access;
};

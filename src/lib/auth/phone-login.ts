export const normalizePhoneForLogin = (phone: string) =>
  phone.replace(/\D/g, "");

export const getPhoneLoginEmail = (phone: string) => {
  const normalizedPhone = normalizePhoneForLogin(phone);

  return `${normalizedPhone || "cliente"}@phone.bitoll.local`;
};

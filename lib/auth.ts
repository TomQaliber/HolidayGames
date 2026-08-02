export const AUTH_COOKIE = "hg_auth";

export function getFamilyPin(): string {
  return process.env.FAMILY_PIN ?? "1234";
}

export function isValidPin(pin: string): boolean {
  return pin === getFamilyPin();
}

export function isAuthenticated(cookieValue: string | undefined): boolean {
  return cookieValue === "1";
}

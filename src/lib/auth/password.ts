/**
 * Simulated credential helpers for the IntakeIQ demo.
 *
 * There is no backend, so passwords are hashed client-side with a small
 * deterministic digest before they touch localStorage. This is NOT a
 * substitute for a real KDF (bcrypt/argon2 on a server) — it exists so the
 * demo never stores plaintext passwords and so login can be meaningfully
 * rejected for a wrong password.
 */

/** Shared password for the seeded 1-click demo profiles. */
export const DEMO_PASSWORD = "demo-password-2026";

export const PASSWORD_MIN_LENGTH = 8;

const SALT = "intakeiq-demo-salt::";

function fnv1a(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function hashPassword(password: string): string {
  const material = `${SALT}${password}`;
  const a = fnv1a(material, 0x811c9dc5).toString(16).padStart(8, "0");
  const b = fnv1a(material.split("").reverse().join(""), 0x9747b28c).toString(16).padStart(8, "0");
  const c = fnv1a(`${material.length}:${material}`, 0x1b873593).toString(16).padStart(8, "0");
  return `v1$${a}${b}${c}`;
}

/** Returns a human-readable problem, or null when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

/** Opaque, URL-safe single-use token. */
export function generateToken(prefix: string): string {
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand()}${rand()}`;
}

/** Absolute origin for links we "email" — works on localhost and any deployment. */
export function appOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

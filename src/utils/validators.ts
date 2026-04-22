export function isValidEmail(email: string) {
  // Intentionally simple for scaffolding; tighten for production.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function minLength(value: string, min: number) {
  return value.length >= min;
}

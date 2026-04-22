export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function isPresent(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

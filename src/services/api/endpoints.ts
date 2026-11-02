export const endpoints = {
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  authForgotPassword: '/auth/forgot-password',
  reports: '/reports',
  uploadImage: '/uploads/image',
  inference: '/cv/infer',
  weatherContext: '/weather/context',
} as const;

export function weatherContextPath(lat: number, lon: number) {
  const q = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  return `${endpoints.weatherContext}?${q.toString()}`;
}

export function reportByIdPath(id: string) {
  return `${endpoints.reports}/${encodeURIComponent(id)}`;
}

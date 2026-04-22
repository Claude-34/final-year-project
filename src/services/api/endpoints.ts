export const endpoints = {
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  authForgotPassword: '/auth/forgot-password',
  reports: '/reports',
  inference: '/cv/infer',
} as const;

export function reportByIdPath(id: string) {
  return `${endpoints.reports}/${encodeURIComponent(id)}`;
}

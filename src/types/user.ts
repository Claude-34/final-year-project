export type UserRole = 'citizen' | 'engineer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

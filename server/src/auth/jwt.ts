import jwt from 'jsonwebtoken';

import type { Env } from '../env.js';

export type JwtClaims = { sub: string; email: string; role: string };

export function signToken(env: Env, claims: JwtClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: '14d' });
}

export function verifyToken(env: Env, token: string): JwtClaims {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== 'object' || decoded == null) throw new Error('Invalid token');
  const sub = (decoded as jwt.JwtPayload).sub;
  const email = (decoded as jwt.JwtPayload).email;
  const role = (decoded as jwt.JwtPayload).role;
  if (typeof sub !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    throw new Error('Invalid token');
  }
  return { sub, email, role };
}

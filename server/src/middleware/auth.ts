import type { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../auth/jwt.js';
import type { Env } from '../env.js';

export type AuthedRequest = Request & {
  userId?: string;
  userEmail?: string;
  userRole?: string;
};

export function requireAuth(env: Env) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ message: 'Missing Authorization bearer token' });
      return;
    }
    try {
      const claims = verifyToken(env, token);
      req.userId = claims.sub;
      req.userEmail = claims.email;
      req.userRole = claims.role;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const role = req.userRole;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

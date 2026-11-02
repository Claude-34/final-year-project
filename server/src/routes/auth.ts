import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';

import { signToken } from '../auth/jwt.js';
import type { Env } from '../env.js';
import { prisma } from '../prisma.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

function sessionPayload(user: { id: string; name: string; email: string; role: string }, env: Env) {
  const token = signToken(env, { sub: user.id, email: user.email, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export function createAuthRouter(env: Env) {
  const r = Router();

  r.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid registration body' });
      return;
    }
    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'citizen',
      },
    });
    res.status(201).json(sessionPayload(user, env));
  });

  r.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid login body' });
      return;
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    res.json(sessionPayload(user, env));
  });

  r.post('/forgot-password', async (req, res) => {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid email' });
      return;
    }
    res.json({ ok: true as const });
  });

  return r;
}

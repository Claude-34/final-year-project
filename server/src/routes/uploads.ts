import { Router } from 'express';
import multer from 'multer';

import { configureCloudinary, uploadBuffer } from '../cloudinary.js';
import type { Env } from '../env.js';
import { isCloudinaryConfigured } from '../env.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});

export function createUploadsRouter(env: Env) {
  const r = Router();
  const auth = requireAuth(env);

  r.post('/image', auth, upload.single('image'), async (req: AuthedRequest, res) => {
    if (!isCloudinaryConfigured(env)) {
      res.status(503).json({ message: 'Image upload is not configured (Cloudinary env vars missing)' });
      return;
    }
    configureCloudinary(env);

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Missing image file (field name: image)' });
      return;
    }

    try {
      const folder = `pothole-reports/${req.userId ?? 'anonymous'}`;
      const result = await uploadBuffer(file.buffer, folder);
      res.status(201).json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  return r;
}

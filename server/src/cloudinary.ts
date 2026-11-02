import { v2 as cloudinary } from 'cloudinary';

import type { Env } from './env.js';
import { isCloudinaryConfigured } from './env.js';

export function configureCloudinary(env: Env) {
  if (!isCloudinaryConfigured(env)) return false;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
  return true;
}

export function uploadBuffer(
  buffer: Buffer,
  folder: string,
): Promise<{ imageUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err || !result?.secure_url) {
          reject(err ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ imageUrl: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

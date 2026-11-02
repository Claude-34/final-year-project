import { appConfig } from '@/config/app.config';
import { apiFetch } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';

type UploadResponse = { imageUrl: string; publicId: string };

/** Upload a local file URI to Cloudinary via the API. Returns HTTPS URL. */
export async function uploadReportImage(localUri: string): Promise<string> {
  if (!appConfig.apiBaseUrl) return localUri;
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) return localUri;

  const form = new FormData();
  const name = localUri.split('/').pop() ?? 'report.jpg';
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : 'jpg';
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';

  form.append('image', {
    uri: localUri,
    name: name.includes('.') ? name : `${name}.jpg`,
    type,
  } as unknown as Blob);

  const res = (await apiFetch(endpoints.uploadImage, { method: 'POST', body: form })) as UploadResponse;
  return res.imageUrl;
}

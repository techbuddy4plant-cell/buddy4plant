/**
 * Uploads admin photos / videos to the website server (POST /api/admin/upload).
 * Photos are resized in the browser first (max 1600px, JPEG) so pages stay fast.
 */
const KEY_STORAGE = 'b4p_upload_key';

export class UploadKeyError extends Error {}

export const getUploadKey = () => {
  try {
    return sessionStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
};
export const setUploadKey = (k: string) => {
  try {
    sessionStorage.setItem(KEY_STORAGE, k);
  } catch {
    /* ignore */
  }
};

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this image'));
    };
    img.src = url;
  });

/** Resize a photo to at most `max` px on the long side and return a JPEG blob. */
export async function resizePhoto(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), 'image/jpeg', quality));
}

/** Upload one photo or video. Returns the public URL (e.g. /uploads/projects/lawn-abc.jpg). */
export async function uploadMedia(file: File, folder = 'projects'): Promise<string> {
  const isVideo = file.type.startsWith('video/');
  if (!isVideo && !file.type.startsWith('image/')) throw new Error(`${file.name}: not a photo or video`);
  if (isVideo && file.size > 80 * 1024 * 1024) throw new Error(`${file.name}: video is larger than 80 MB - please trim or compress it`);
  const body: Blob = isVideo ? file : await resizePhoto(file);
  const type = isVideo ? file.type : 'image/jpeg';
  const res = await fetch(`/api/admin/upload?folder=${encodeURIComponent(folder)}&name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': type, 'x-b4p-upload-key': getUploadKey() },
    body,
  });
  if (res.status === 401) throw new UploadKeyError('Upload key required');
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || `${file.name}: upload failed`);
  return data.url as string;
}

/** Grab a still frame from a video file to use as its poster image. */
export async function videoPoster(file: File, folder = 'projects'): Promise<string | undefined> {
  try {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.src = url;
    await new Promise<void>((res, rej) => {
      v.onloadeddata = () => res();
      v.onerror = () => rej(new Error('video'));
    });
    v.currentTime = Math.min(1.5, (v.duration || 2) / 2);
    await new Promise<void>((res) => (v.onseeked = () => res()));
    const c = document.createElement('canvas');
    const scale = Math.min(1, 900 / Math.max(v.videoWidth, v.videoHeight));
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.8));
    if (!blob) return undefined;
    const poster = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-poster.jpg', { type: 'image/jpeg' });
    return await uploadMedia(poster, folder);
  } catch {
    return undefined;
  }
}

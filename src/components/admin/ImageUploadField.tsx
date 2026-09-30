import React, { useRef, useState } from 'react';
import { ImagePlus, KeyRound, Link as LinkIcon, Loader2, Trash2 } from 'lucide-react';
import { UploadKeyError, setUploadKey, uploadMedia } from '../../services/uploadService';

/**
 * One photo with preview: upload from computer (resized automatically), paste a link, or remove.
 * Used for blog covers, collection covers and similar single images in the admin panel.
 */
export const ImageUploadField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  hint?: string;
  aspect?: string;
}> = ({ label, value, onChange, folder, hint, aspect = 'aspect-[16/9]' }) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needKey, setNeedKey] = useState(false);
  const [key, setKey] = useState('');
  const [showLink, setShowLink] = useState(false);
  const pending = useRef<File | null>(null);

  const upload = async (file?: File | null) => {
    if (!file) return;
    pending.current = file;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadMedia(file, folder));
      pending.current = null;
    } catch (e: any) {
      if (e instanceof UploadKeyError) setNeedKey(true);
      else setError(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="block font-semibold text-[#1A1A1A] text-xs">{label}</span>
          {hint && <span className="block text-[10px] text-[#7A7A7A]">{hint}</span>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="px-3 py-1.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
            {busy ? 'Uploading...' : value ? 'Change photo' : 'Upload photo'}
          </button>
          <button
            type="button"
            title="Paste a link instead"
            onClick={() => setShowLink((v) => !v)}
            className="p-1.5 rounded-md border border-[#D5D2C9] bg-white text-[#1F3B22]"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {value && (
            <button type="button" title="Remove photo" onClick={() => onChange('')} className="p-1.5 rounded-md border border-[#D5D2C9] bg-white text-[#B42318]">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      </div>

      {value ? (
        <button type="button" onClick={() => input.current?.click()} className={`relative block w-full ${aspect} max-h-56 rounded-lg overflow-hidden bg-[#F5F2EB] border border-[#E5E2D9] group`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100">
            Click to change
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="w-full py-7 border-2 border-dashed border-[#D5D2C9] rounded-lg text-[#7A7A7A] text-xs flex flex-col items-center gap-1 hover:border-[#2D6A4F]"
        >
          <ImagePlus className="w-5 h-5" /> Upload a photo from your computer
        </button>
      )}

      {showLink && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /folder/photo.jpg"
          className="w-full px-3 py-1.5 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
        />
      )}
      {error && <div className="text-[11px] font-semibold text-[#B42318]">{error}</div>}
      {needKey && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#FFF8E6] border border-[#F1D58A] text-[11px]">
          <KeyRound className="w-4 h-4 text-[#8A6A00]" />
          <span className="font-semibold">Upload key:</span>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="px-2 py-1 border rounded-md" />
          <button
            type="button"
            className="px-2 py-1 bg-[#2D4A27] text-white rounded-md font-bold"
            onClick={() => {
              setUploadKey(key.trim());
              setNeedKey(false);
              upload(pending.current);
            }}
          >
            Save &amp; retry
          </button>
        </div>
      )}
    </div>
  );
};

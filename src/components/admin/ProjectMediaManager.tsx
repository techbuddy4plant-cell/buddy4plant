import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Film, ImagePlus, KeyRound, Link as LinkIcon, Loader2, Star, Trash2, Upload } from 'lucide-react';
import { UploadKeyError, setUploadKey, uploadMedia, videoPoster } from '../../services/uploadService';

export interface ProjectMediaValue {
  /** photos in display order - the first one is the cover */
  photos: string[];
  videos: { src: string; poster?: string }[];
  beforeAfter?: { before: string; after: string };
}

const btn = 'w-6 h-6 rounded-md bg-white/95 text-[#1F3B22] flex items-center justify-center shadow hover:bg-white disabled:opacity-40';

/** Admin tool for a project's cover, site photos, videos and before/after pair. */
export const ProjectMediaManager: React.FC<{ value: ProjectMediaValue; onChange: (v: ProjectMediaValue) => void }> = ({ value, onChange }) => {
  const { photos, videos, beforeAfter } = value;
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [needKey, setNeedKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [link, setLink] = useState('');
  const [pendingBefore, setPendingBefore] = useState<string | null>(beforeAfter?.before || null);
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const lastFiles = useRef<{ files: File[]; kind: 'photo' | 'video' } | null>(null);

  const set = (patch: Partial<ProjectMediaValue>) => onChange({ ...value, ...patch });

  const run = async (files: File[], kind: 'photo' | 'video') => {
    if (!files.length) return;
    lastFiles.current = { files, kind };
    setError('');
    const added: string[] = [];
    const addedVideos: { src: string; poster?: string }[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setBusy(`Uploading ${kind === 'photo' ? 'photo' : 'video'} ${i + 1} of ${files.length}...`);
        const url = await uploadMedia(files[i]);
        if (kind === 'photo') added.push(url);
        else addedVideos.push({ src: url, poster: await videoPoster(files[i]) });
      }
      lastFiles.current = null;
    } catch (e: any) {
      if (e instanceof UploadKeyError) setNeedKey(true);
      else setError(e?.message || 'Upload failed');
    } finally {
      setBusy('');
      if (added.length) set({ photos: [...photos, ...added] });
      if (addedVideos.length) set({ videos: [...videos, ...addedVideos] });
    }
  };

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    set({ photos: next });
  };
  const makeCover = (i: number) => set({ photos: [photos[i], ...photos.filter((_, k) => k !== i)] });
  const remove = (i: number) => {
    const src = photos[i];
    const ba = beforeAfter && (beforeAfter.before === src || beforeAfter.after === src) ? undefined : beforeAfter;
    onChange({ ...value, photos: photos.filter((_, k) => k !== i), beforeAfter: ba });
  };
  const markBefore = (src: string) => {
    setPendingBefore(src);
    if (beforeAfter) set({ beforeAfter: { before: src, after: beforeAfter.after } });
  };
  const markAfter = (src: string) => {
    const before = pendingBefore || beforeAfter?.before;
    if (!before || before === src) {
      setError('Choose the "Before" photo first, then the "After" photo.');
      return;
    }
    setError('');
    set({ beforeAfter: { before, after: src } });
  };

  const addLink = () => {
    const u = link.trim();
    if (!u) return;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) set({ videos: [...videos, { src: u, poster: u.replace(/\.(mp4|webm|mov)$/i, '.jpg') }] });
    else set({ photos: [...photos, u] });
    setLink('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-[#E5E2D9] bg-[#FAF9F5] p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="block font-bold text-[#1A1A1A]">Photos &amp; videos</span>
          <span className="text-[10px] text-[#7A7A7A]">
            The first photo is the cover. Photos are resized automatically before upload.
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={!!busy} onClick={() => photoInput.current?.click()} className="px-3 py-1.5 bg-[#2D4A27] text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50">
            <ImagePlus className="w-3.5 h-3.5" /> Upload photos
          </button>
          <button type="button" disabled={!!busy} onClick={() => videoInput.current?.click()} className="px-3 py-1.5 bg-white border border-[#D5D2C9] text-[#1F3B22] rounded-md text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Film className="w-3.5 h-3.5" /> Upload videos
          </button>
        </div>
        <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => { run(Array.from(e.target.files || []), 'photo'); e.target.value = ''; }} />
        <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => { run(Array.from(e.target.files || []), 'video'); e.target.value = ''; }} />
      </div>

      {busy && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#2D6A4F]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {busy}
        </div>
      )}
      {error && <div className="text-[11px] font-semibold text-[#B42318]">{error}</div>}
      {needKey && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-[#FFF8E6] border border-[#F1D58A] text-[11px]">
          <KeyRound className="w-4 h-4 text-[#8A6A00]" />
          <span className="font-semibold text-[#5C4600]">Enter the upload key (ADMIN_UPLOAD_KEY on the server):</span>
          <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} className="px-2 py-1 border border-[#D5D2C9] rounded-md bg-white" />
          <button
            type="button"
            onClick={() => {
              setUploadKey(keyInput.trim());
              setNeedKey(false);
              if (lastFiles.current) run(lastFiles.current.files, lastFiles.current.kind);
            }}
            className="px-2.5 py-1 bg-[#2D4A27] text-white rounded-md font-bold"
          >
            Save &amp; retry
          </button>
        </div>
      )}

      {photos.length === 0 ? (
        <button type="button" onClick={() => photoInput.current?.click()} className="w-full py-8 border-2 border-dashed border-[#D5D2C9] rounded-xl text-[#7A7A7A] text-xs flex flex-col items-center gap-1.5 hover:border-[#2D6A4F]">
          <Upload className="w-5 h-5" /> Upload the project photos
        </button>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((src, i) => {
            const isBefore = beforeAfter?.before === src || (!beforeAfter && pendingBefore === src);
            const isAfter = beforeAfter?.after === src;
            return (
              <div key={src + i} className={`relative aspect-square rounded-lg overflow-hidden bg-[#EEE] group border-2 ${i === 0 ? 'border-[#2D6A4F]' : 'border-transparent'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 flex flex-col gap-1 items-start">
                  {i === 0 && <span className="px-1.5 py-0.5 rounded bg-[#2D6A4F] text-white text-[9px] font-bold">COVER</span>}
                  {isBefore && <span className="px-1.5 py-0.5 rounded bg-white text-[#6B4A2B] text-[9px] font-bold">BEFORE</span>}
                  {isAfter && <span className="px-1.5 py-0.5 rounded bg-[#1F3B22] text-white text-[9px] font-bold">AFTER</span>}
                </div>
                <div className="absolute inset-x-1 bottom-1 flex flex-wrap gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button type="button" title="Move left" className={btn} disabled={i === 0} onClick={() => move(i, -1)}><ArrowLeft className="w-3 h-3" /></button>
                  <button type="button" title="Move right" className={btn} disabled={i === photos.length - 1} onClick={() => move(i, 1)}><ArrowRight className="w-3 h-3" /></button>
                  {i !== 0 && <button type="button" title="Make cover" className={btn} onClick={() => makeCover(i)}><Star className="w-3 h-3" /></button>}
                  <button type="button" title="Use as BEFORE photo" className={`${btn} text-[9px] font-extrabold`} onClick={() => markBefore(src)}>B</button>
                  <button type="button" title="Use as AFTER photo" className={`${btn} text-[9px] font-extrabold`} onClick={() => markAfter(src)}>A</button>
                  <button type="button" title="Remove" className={`${btn} text-[#B42318]`} onClick={() => remove(i)}><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {beforeAfter && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#4A4A4A]">
          <span>Before &amp; after pair is set - it shows at the top of the project window.</span>
          <button type="button" onClick={() => { setPendingBefore(null); set({ beforeAfter: undefined }); }} className="font-bold text-[#B42318]">Remove pair</button>
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A5A]">Videos ({videos.length})</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {videos.map((v, i) => (
              <div key={v.src + i} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
                {v.poster ? <img src={v.poster} alt="" className="w-full h-full object-cover opacity-90" /> : <Film className="w-6 h-6 text-white/70 absolute inset-0 m-auto" />}
                <button type="button" title="Remove video" className={`${btn} absolute top-1 right-1 text-[#B42318]`} onClick={() => set({ videos: videos.filter((_, k) => k !== i) })}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
            placeholder="...or paste a photo / .mp4 link"
            className="w-full pl-8 pr-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[11px] focus:outline-none focus:border-[#2D4A27]"
          />
        </div>
        <button type="button" onClick={addLink} className="px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[11px] font-bold text-[#1F3B22]">Add</button>
      </div>
    </div>
  );
};

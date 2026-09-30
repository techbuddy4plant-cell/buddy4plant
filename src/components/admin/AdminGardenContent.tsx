import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronDown, ExternalLink, ImagePlus, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import {
  DEFAULT_GARDEN_CONTENT,
  GARDEN_ICON_NAMES,
  GardenServicesContent,
  GardenSeason,
  GardenService,
  GardenStat,
  resolveGardenContent,
} from '../../data/gardenServicesContent';
import { UploadKeyError, setUploadKey, uploadMedia } from '../../services/uploadService';
import { getProjects } from '../../services/projectService';
import { BotanicalProject } from '../../types';

/* ------------------------------------------------------------------ */
/* Small form helpers                                                   */
/* ------------------------------------------------------------------ */

const inputCls =
  'w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] text-xs focus:outline-none focus:border-[#2D4A27] focus:ring-1 focus:ring-[#2D4A27]';

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }> = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
}) => (
  <label className="block">
    <span className="block font-bold text-[#1A1A1A] text-xs mb-1">{label}</span>
    <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    {hint && <span className="text-[10px] text-[#7A7A7A]">{hint}</span>}
  </label>
);

const Area: React.FC<{ label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }> = ({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}) => (
  <label className="block">
    <span className="block font-bold text-[#1A1A1A] text-xs mb-1">{label}</span>
    <textarea className={inputCls} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    {hint && <span className="text-[10px] text-[#7A7A7A]">{hint}</span>}
  </label>
);

/** A list of short texts edited as "one per line". */
const Lines: React.FC<{ label: string; value: string[]; onChange: (v: string[]) => void; rows?: number; hint?: string }> = ({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}) => {
  const [text, setText] = useState(value.join('\n'));
  const last = useRef(value.join('\n'));
  useEffect(() => {
    const joined = value.join('\n');
    if (joined !== last.current) {
      last.current = joined;
      setText(joined);
    }
  }, [value]);
  return (
    <Area
      label={label}
      rows={rows}
      value={text}
      hint={hint || 'One per line'}
      onChange={(t) => {
        setText(t);
        const list = t.split('\n').map((x) => x.trim()).filter(Boolean);
        last.current = list.join('\n');
        onChange(list);
      }}
    />
  );
};

const IconSelect: React.FC<{ value: string; onChange: (v: any) => void }> = ({ value, onChange }) => (
  <label className="block">
    <span className="block font-bold text-[#1A1A1A] text-xs mb-1">Icon</span>
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      {GARDEN_ICON_NAMES.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  </label>
);

/** Repeating items (services, FAQs, steps...) with add / remove / move. */
function ItemList<T>({
  items,
  onChange,
  newItem,
  addLabel,
  title,
  render,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  newItem: () => T;
  addLabel: string;
  title: (item: T, i: number) => string;
  render: (item: T, set: (patch: Partial<T>) => void, i: number) => React.ReactNode;
}) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-[#E5E2D9] bg-[#FAF9F5] p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#1F3B22] truncate">
              {i + 1}. {title(it, i) || '(untitled)'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-1.5 rounded-md hover:bg-white disabled:opacity-30">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" title="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="p-1.5 rounded-md hover:bg-white disabled:opacity-30">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button type="button" title="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} className="p-1.5 rounded-md hover:bg-white text-[#B42318]">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {render(it, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="w-full py-2 border-2 border-dashed border-[#D5D2C9] rounded-xl text-xs font-bold text-[#1F3B22] hover:border-[#2D6A4F] flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/** Upload / remove / reorder a list of photos (or a single photo when max = 1). */
const PhotoPicker: React.FC<{ label: string; value: string[]; onChange: (v: string[]) => void; max?: number; hint?: string }> = ({
  label,
  value,
  onChange,
  max,
  hint,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [needKey, setNeedKey] = useState(false);
  const [key, setKey] = useState('');
  const [link, setLink] = useState('');
  const pending = useRef<File[]>([]);

  const upload = async (files: File[]) => {
    pending.current = files;
    setErr('');
    const urls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setBusy(`Uploading ${i + 1} of ${files.length}...`);
        urls.push(await uploadMedia(files[i], 'garden'));
      }
      pending.current = [];
    } catch (e: any) {
      if (e instanceof UploadKeyError) setNeedKey(true);
      else setErr(e?.message || 'Upload failed');
    } finally {
      setBusy('');
      if (urls.length) onChange(max === 1 ? urls.slice(-1) : [...value, ...urls]);
    }
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="block font-bold text-[#1A1A1A] text-xs">{label}</span>
          {hint && <span className="text-[10px] text-[#7A7A7A]">{hint}</span>}
        </div>
        <button type="button" disabled={!!busy} onClick={() => ref.current?.click()} className="px-3 py-1.5 bg-[#2D4A27] text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50 shrink-0">
          <ImagePlus className="w-3.5 h-3.5" /> {max === 1 ? (value.length ? 'Replace photo' : 'Upload photo') : 'Upload photos'}
        </button>
        <input ref={ref} type="file" accept="image/*" multiple={max !== 1} hidden onChange={(e) => { upload(Array.from(e.target.files || [])); e.target.value = ''; }} />
      </div>
      {busy && <div className="text-[11px] font-semibold text-[#2D6A4F] flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {busy}</div>}
      {err && <div className="text-[11px] font-semibold text-[#B42318]">{err}</div>}
      {needKey && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#FFF8E6] border border-[#F1D58A] text-[11px]">
          <span className="font-semibold">Upload key:</span>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="px-2 py-1 border rounded-md" />
          <button type="button" className="px-2 py-1 bg-[#2D4A27] text-white rounded-md font-bold" onClick={() => { setUploadKey(key.trim()); setNeedKey(false); upload(pending.current); }}>
            Save &amp; retry
          </button>
        </div>
      )}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {value.map((src, i) => (
            <div key={src + i} className="relative aspect-square rounded-lg overflow-hidden bg-[#EEE] group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-x-1 bottom-1 flex gap-1">
                {max !== 1 && (
                  <>
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="w-6 h-6 rounded bg-white/95 flex items-center justify-center disabled:opacity-40"><ArrowUp className="w-3 h-3 -rotate-90" /></button>
                    <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="w-6 h-6 rounded bg-white/95 flex items-center justify-center disabled:opacity-40"><ArrowDown className="w-3 h-3 -rotate-90" /></button>
                  </>
                )}
                <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="w-6 h-6 rounded bg-white/95 text-[#B42318] flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input className={inputCls} placeholder="...or paste a photo link" value={link} onChange={(e) => setLink(e.target.value)} />
        <button
          type="button"
          onClick={() => {
            if (!link.trim()) return;
            onChange(max === 1 ? [link.trim()] : [...value, link.trim()]);
            setLink('');
          }}
          className="px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[11px] font-bold"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; hint?: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({
  title,
  hint,
  open,
  onToggle,
  children,
}) => (
  <div className="bg-white rounded-xl border border-[#E5E2D9] overflow-hidden">
    <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FAF9F5]">
      <div>
        <span className="block text-sm font-bold text-[#1A1A1A]">{title}</span>
        {hint && <span className="block text-[11px] text-[#7A7A7A]">{hint}</span>}
      </div>
      <ChevronDown className={`w-4 h-4 text-[#5A5A5A] transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#F0EDE5]">{children}</div>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */

/** Drag (or use the arrows) to set the order of the project cards on the Gardening Services page. */
const ProjectOrderEditor: React.FC<{ order: string[]; onChange: (ids: string[]) => void }> = ({ order, onChange }) => {
  const [projects, setProjects] = useState<BotanicalProject[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  useEffect(() => {
    const load = () => getProjects().then((d) => setProjects((d || []).filter((p) => p.active !== false)));
    load();
    window.addEventListener('b4p_store_data_changed', load);
    return () => window.removeEventListener('b4p_store_data_changed', load);
  }, []);

  const pos = new Map(order.map((id, i) => [id, i] as [string, number]));
  const sorted = projects
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (pos.get(a.p.id) ?? 1e6 + a.i) - (pos.get(b.p.id) ?? 1e6 + b.i))
    .map((x) => x.p);

  const groups: { title: string; items: BotanicalProject[] }[] = [
    { title: 'Our Work (main project cards)', items: sorted.filter((p) => p.segment !== 'private') },
    { title: 'Private Projects', items: sorted.filter((p) => p.segment === 'private') },
  ].filter((g) => g.items.length);

  // Moving inside one group keeps the other group's order untouched
  const commit = (group: BotanicalProject[], next: BotanicalProject[]) => {
    const ids = new Set(group.map((p) => p.id));
    let k = 0;
    onChange(sorted.map((p) => (ids.has(p.id) ? next[k++].id : p.id)));
  };
  const move = (group: BotanicalProject[], from: number, to: number) => {
    if (to < 0 || to >= group.length || from === to) return;
    const next = [...group];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    commit(group, next);
  };

  if (!projects.length) return <p className="text-[11px] text-[#7A7A7A]">Loading projects...</p>;

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.title} className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E58]">{g.title}</p>
          <ol className="space-y-1.5">
            {g.items.map((p, i) => (
              <li
                key={p.id}
                draggable
                onDragStart={() => setDragId(p.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = g.items.findIndex((x) => x.id === dragId);
                  if (from >= 0) move(g.items, from, i);
                  setDragId(null);
                }}
                className={`flex items-center gap-3 rounded-xl border bg-white p-2 pr-2.5 cursor-grab active:cursor-grabbing transition-colors ${
                  dragId === p.id ? 'border-[#2D6A4F] bg-[#EEF5EC] opacity-70' : 'border-[#E5E2D9] hover:border-[#2D6A4F]'
                }`}
              >
                <span className="w-6 text-center font-bold text-[#7A7A7A]">{i + 1}</span>
                <span className="text-[#A5A29A]" aria-hidden="true">&#8942;&#8942;</span>
                <img src={p.image} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover bg-[#F0EDE6]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[#1A1A1A]">{p.title}</span>
                  <span className="block truncate text-[10px] text-[#7A7A7A]">{p.category}</span>
                </span>
                <button type="button" title="Move to top" disabled={i === 0} onClick={() => move(g.items, i, 0)} className="rounded-md border border-[#E5E2D9] px-2 py-1 font-bold text-[#1F3B22] disabled:opacity-30">Top</button>
                <button type="button" title="Move up" disabled={i === 0} onClick={() => move(g.items, i, i - 1)} className="rounded-md border border-[#E5E2D9] p-1.5 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button type="button" title="Move down" disabled={i === g.items.length - 1} onClick={() => move(g.items, i, i + 1)} className="rounded-md border border-[#E5E2D9] p-1.5 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {order.length > 0 && (
        <button type="button" onClick={() => onChange([])} className="text-[11px] font-bold text-[#B42318] hover:underline">
          Reset to the default order
        </button>
      )}
    </div>
  );
};

export const AdminGardenContent: React.FC = () => {
  const { homepageCMS, updateHomepageCMS } = useStoreSettings();
  const cms = homepageCMS as any;
  const [c, setC] = useState<GardenServicesContent>(() => resolveGardenContent(cms.gardenServicesContent, cms));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [open, setOpen] = useState<string>('hero');

  // Pick up content saved on another device / tab while nothing is being edited here
  useEffect(() => {
    if (!dirty) setC(resolveGardenContent(cms.gardenServicesContent, cms));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cms.gardenServicesContent]);

  const upd = <K extends keyof GardenServicesContent>(key: K, patch: Partial<GardenServicesContent[K]> | GardenServicesContent[K]) => {
    setC((prev) => {
      const cur = prev[key] as unknown;
      const next = Array.isArray(cur) || typeof cur !== 'object' || cur === null ? patch : { ...(cur as object), ...(patch as object) };
      return { ...prev, [key]: next as GardenServicesContent[K] };
    });
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateHomepageCMS({ ...homepageCMS, gardenServicesContent: c } as any);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const sec = (id: string) => ({ open: open === id, onToggle: () => setOpen(open === id ? '' : id) });

  return (
    <div className="space-y-3 text-xs">
      <div className="sticky top-0 z-10 bg-[#F7F5F0]/95 backdrop-blur py-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Gardening Services page content</h3>
          <p className="text-[11px] text-[#5A5A5A]">Every heading, text, button, list, tip, FAQ, form option and photo on the page. Projects are edited in the Projects tab.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/garden-services" target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border border-[#D5D2C9] rounded-md font-bold text-[#1F3B22] flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" /> View page
          </a>
          {confirmReset ? (
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-[#B42318]">Reset all text to the original?</span>
              <button type="button" onClick={() => { setC(DEFAULT_GARDEN_CONTENT); setDirty(true); setConfirmReset(false); }} className="px-2.5 py-2 bg-[#B42318] text-white rounded-md font-bold">Yes, reset</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="px-2.5 py-2 bg-white border rounded-md font-bold">No</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="px-3 py-2 bg-white border border-[#D5D2C9] rounded-md font-bold text-[#5A5A5A] flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button type="button" onClick={save} disabled={saving || !dirty} className="px-4 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-md font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved' : dirty ? 'Save changes' : 'All saved'}
          </button>
        </div>
      </div>

      <Section title="Top banner" hint="Badge, headline, text, buttons and the rotating photos" {...sec('hero')}>
        <Field label="Small badge above the headline" value={c.hero.badge} onChange={(v) => upd('hero', { badge: v })} />
        <Field label="Headline" value={c.hero.headline} onChange={(v) => upd('hero', { headline: v })} />
        <Field label="Words to show in light green" value={c.hero.highlightWords} onChange={(v) => upd('hero', { highlightWords: v })} hint="Type words from the headline, separated by spaces" />
        <Area label="Text under the headline" value={c.hero.subtitle} onChange={(v) => upd('hero', { subtitle: v })} />
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Main button" value={c.hero.primaryButton} onChange={(v) => upd('hero', { primaryButton: v })} />
          <Field label="WhatsApp button" value={c.hero.whatsappButton} onChange={(v) => upd('hero', { whatsappButton: v })} />
          <Field label="Projects link" value={c.hero.projectsButton} onChange={(v) => upd('hero', { projectsButton: v })} />
        </div>
        <Area label="WhatsApp message (pre-filled)" rows={2} value={c.hero.whatsappMessage} onChange={(v) => upd('hero', { whatsappMessage: v })} />
        <PhotoPicker label="Rotating photos on the right" hint="Leave empty to use the project cover photos automatically" value={c.hero.images} onChange={(v) => upd('hero', { images: v })} />
      </Section>

      <Section title="Numbers strip" hint="The 4 number boxes under the banner" {...sec('stats')}>
        <ItemList<GardenStat>
          items={c.stats}
          onChange={(v) => upd('stats', v)}
          addLabel="Add a number box"
          newItem={() => ({ value: '10', suffix: '+', label: 'New number', icon: 'Leaf' })}
          title={(s) => s.label}
          render={(s, set) => (
            <div className="grid sm:grid-cols-4 gap-3">
              <label className="block">
                <span className="block font-bold text-[#1A1A1A] text-xs mb-1">Number</span>
                <select
                  className={inputCls}
                  value={s.value.startsWith('auto:') ? s.value : 'custom'}
                  onChange={(e) => set({ value: e.target.value === 'custom' ? '10' : e.target.value })}
                >
                  <option value="auto:projects">Auto: number of projects</option>
                  <option value="auto:sites">Auto: number of sites</option>
                  <option value="auto:multisite">Auto: most sites in one project</option>
                  <option value="custom">Type a number</option>
                </select>
                {!s.value.startsWith('auto:') && <input className={`${inputCls} mt-1`} type="number" value={s.value} onChange={(e) => set({ value: e.target.value })} />}
              </label>
              <Field label="After the number" value={s.suffix} onChange={(v) => set({ suffix: v })} hint='e.g. "+" or " months"' />
              <Field label="Label" value={s.label} onChange={(v) => set({ label: v })} />
              <IconSelect value={s.icon} onChange={(v) => set({ icon: v })} />
            </div>
          )}
        />
        <Field label='"Trusted by" heading' value={c.trustedByLabel} onChange={(v) => upd('trustedByLabel', v as any)} />
        <Lines label="Extra names for the scrolling client strip" hint="Project clients are added automatically. One name per line." value={c.trustedByExtra} onChange={(v) => upd('trustedByExtra', v)} />
      </Section>

      <Section title="Projects headings" hint='"Our Work" and "Private Projects" sections' {...sec('projects')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Our Work - small heading" value={c.projectsSection.eyebrow} onChange={(v) => upd('projectsSection', { eyebrow: v })} />
          <Field label="Our Work - title" value={c.projectsSection.title} onChange={(v) => upd('projectsSection', { title: v })} />
        </div>
        <Area label="Our Work - text" value={c.projectsSection.subtitle} onChange={(v) => upd('projectsSection', { subtitle: v })} />
        <label className="flex items-center gap-2 font-bold text-[#1F3B22] pt-2">
          <input type="checkbox" className="accent-[#2D4A27]" checked={c.privateSection.enabled} onChange={(e) => upd('privateSection', { enabled: e.target.checked })} />
          Show the Private Projects section
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Private - small heading" value={c.privateSection.eyebrow} onChange={(v) => upd('privateSection', { eyebrow: v })} />
          <Field label="Private - title" value={c.privateSection.title} onChange={(v) => upd('privateSection', { title: v })} />
          <Field label="Private - button" value={c.privateSection.button} onChange={(v) => upd('privateSection', { button: v })} />
        </div>
        <Area label="Private - text" value={c.privateSection.subtitle} onChange={(v) => upd('privateSection', { subtitle: v })} />
      </Section>

      <Section title="Arrange project cards" hint="Drag the cards, or use Top / up / down, to set their order on the page" {...sec('order')}>
        <ProjectOrderEditor
          order={c.projectOrder || []}
          onChange={(ids) => {
            setC((prev) => ({ ...prev, projectOrder: ids }));
            setDirty(true);
            setSaved(false);
          }}
        />
        <p className="text-[11px] text-[#7A7A7A]">Click "Save changes" at the top when done. Service cards, steps, tips and questions can be re-ordered with the arrows in their own sections below.</p>
      </Section>

      <Section title="Services" hint="Service cards, with optional photos" {...sec('services')}>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Small heading" value={c.servicesSection.eyebrow} onChange={(v) => upd('servicesSection', { eyebrow: v })} />
          <Field label="Title" value={c.servicesSection.title} onChange={(v) => upd('servicesSection', { title: v })} />
          <Field label='"Get a quote" button' value={c.servicesSection.quoteButton} onChange={(v) => upd('servicesSection', { quoteButton: v })} />
        </div>
        <Field label="Text under the title (optional)" value={c.servicesSection.subtitle} onChange={(v) => upd('servicesSection', { subtitle: v })} />
        <ItemList<GardenService>
          items={c.services}
          onChange={(v) => upd('services', v)}
          addLabel="Add a service"
          newItem={() => ({ id: `svc-${Date.now()}`, icon: 'Leaf', title: 'New service', text: '', points: [], enquiryType: c.form.enquiryTypes[0] || '' })}
          title={(s) => s.title}
          render={(s, set) => (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Field label="Title" value={s.title} onChange={(v) => set({ title: v })} />
                </div>
                <IconSelect value={s.icon} onChange={(v) => set({ icon: v })} />
              </div>
              <Area label="Description" value={s.text} onChange={(v) => set({ text: v })} />
              <Lines label="Points (with tick marks)" rows={3} value={s.points} onChange={(v) => set({ points: v })} />
              <label className="block">
                <span className="block font-bold text-[#1A1A1A] text-xs mb-1">"Get a quote" selects this in the form</span>
                <select className={inputCls} value={s.enquiryType} onChange={(e) => set({ enquiryType: e.target.value })}>
                  {c.form.enquiryTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <PhotoPicker label="Photo (optional)" max={1} value={s.image ? [s.image] : []} onChange={(v) => set({ image: v[0] })} />
            </>
          )}
        />
      </Section>

      <Section title="How it works" hint="The numbered steps" {...sec('process')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Small heading" value={c.process.eyebrow} onChange={(v) => upd('process', { eyebrow: v })} />
          <Field label="Title" value={c.process.title} onChange={(v) => upd('process', { title: v })} />
        </div>
        <ItemList<{ title: string; text: string }>
          items={c.process.steps}
          onChange={(v) => upd('process', { steps: v })}
          addLabel="Add a step"
          newItem={() => ({ title: 'New step', text: '' })}
          title={(s) => s.title}
          render={(s, set) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Step title" value={s.title} onChange={(v) => set({ title: v })} />
              <div className="sm:col-span-2">
                <Field label="Text" value={s.text} onChange={(v) => set({ text: v })} />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Gardening tips by season" hint="Season tabs and their tips" {...sec('tips')}>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Small heading" value={c.tips.eyebrow} onChange={(v) => upd('tips', { eyebrow: v })} />
          <Field label="Title" value={c.tips.title} onChange={(v) => upd('tips', { title: v })} />
          <Field label="Text" value={c.tips.subtitle} onChange={(v) => upd('tips', { subtitle: v })} />
        </div>
        <ItemList<GardenSeason>
          items={c.tips.seasons}
          onChange={(v) => upd('tips', { seasons: v })}
          addLabel="Add a season"
          newItem={() => ({ id: `season-${Date.now()}`, label: 'New season', months: '', icon: 'Leaf', tips: [] })}
          title={(s) => `${s.label} (${s.tips.length} tips)`}
          render={(s, set) => (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Tab name" value={s.label} onChange={(v) => set({ label: v })} />
                <Field label="Months" value={s.months} onChange={(v) => set({ months: v })} />
                <IconSelect value={s.icon} onChange={(v) => set({ icon: v })} />
              </div>
              <ItemList<{ t: string; d: string }>
                items={s.tips}
                onChange={(v) => set({ tips: v })}
                addLabel="Add a tip"
                newItem={() => ({ t: 'New tip', d: '' })}
                title={(t) => t.t}
                render={(t, setT) => (
                  <>
                    <Field label="Tip" value={t.t} onChange={(v) => setT({ t: v })} />
                    <Area label="Explanation" rows={2} value={t.d} onChange={(v) => setT({ d: v })} />
                  </>
                )}
              />
            </>
          )}
        />
      </Section>

      <Section title="Questions (FAQ)" {...sec('faq')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title" value={c.faq.title} onChange={(v) => upd('faq', { title: v })} />
          <Field label="Button" value={c.faq.button} onChange={(v) => upd('faq', { button: v })} />
        </div>
        <Area label="Text" rows={2} value={c.faq.text} onChange={(v) => upd('faq', { text: v })} />
        <ItemList<{ q: string; a: string }>
          items={c.faq.items}
          onChange={(v) => upd('faq', { items: v })}
          addLabel="Add a question"
          newItem={() => ({ q: 'New question?', a: '' })}
          title={(f) => f.q}
          render={(f, set) => (
            <>
              <Field label="Question" value={f.q} onChange={(v) => set({ q: v })} />
              <Area label="Answer" value={f.a} onChange={(v) => set({ a: v })} />
            </>
          )}
        />
      </Section>

      <Section title="Contact panel" hint="Dark panel next to the enquiry form (phone and email come from Admin > Settings)" {...sec('contact')}>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Small heading" value={c.contact.eyebrow} onChange={(v) => upd('contact', { eyebrow: v })} />
          <Field label="Title" value={c.contact.title} onChange={(v) => upd('contact', { title: v })} />
          <Field label='"Call us" label' value={c.contact.callLabel} onChange={(v) => upd('contact', { callLabel: v })} />
        </div>
        <Area label="Text" value={c.contact.text} onChange={(v) => upd('contact', { text: v })} />
        <Lines label="Points with tick marks" rows={3} value={c.contact.bullets} onChange={(v) => upd('contact', { bullets: v })} />
      </Section>

      <Section title="Enquiry form" hint="Choices, labels, buttons and thank-you message" {...sec('form')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Lines label='"What do you need?" choices' rows={6} value={c.form.enquiryTypes} onChange={(v) => upd('form', { enquiryTypes: v })} />
          <Lines label="Property types" rows={6} value={c.form.propertyTypes} onChange={(v) => upd('form', { propertyTypes: v })} />
          <Lines label="Cities" rows={6} value={c.form.cities} onChange={(v) => upd('form', { cities: v })} />
          <Lines label="Area sizes" rows={6} value={c.form.areas} onChange={(v) => upd('form', { areas: v })} />
        </div>
        <label className="block">
          <span className="block font-bold text-[#1A1A1A] text-xs mb-1">Choice that turns the form into a "question"</span>
          <select className={inputCls} value={c.form.helpType} onChange={(e) => upd('form', { helpType: e.target.value })}>
            {c.form.enquiryTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-[10px] text-[#7A7A7A]">Hides the area size and changes the message box to "Your question"</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Send button" value={c.form.submitButton} onChange={(v) => upd('form', { submitButton: v })} />
          <Field label="Send button (question)" value={c.form.helpSubmitButton} onChange={(v) => upd('form', { helpSubmitButton: v })} />
          <Field label="Thank-you title (the name is added after it)" value={c.form.successTitle} onChange={(v) => upd('form', { successTitle: v })} />
          <Field label="Privacy note under the button" value={c.form.privacyNote} onChange={(v) => upd('form', { privacyNote: v })} />
        </div>
        <Area label="Thank-you text" rows={2} hint="Leave empty to show which service they asked for and their phone number" value={c.form.successText} onChange={(v) => upd('form', { successText: v })} />
        <div className="pt-2 border-t border-[#F0EDE5]">
          <span className="block text-xs font-bold text-[#1F3B22] mb-2">Field labels &amp; examples</span>
          <div className="grid sm:grid-cols-2 gap-3">
            {(
              [
                ['need', '"What do you need" label'],
                ['name', 'Name label'],
                ['namePlaceholder', 'Name example'],
                ['phone', 'Mobile label'],
                ['phonePlaceholder', 'Mobile example'],
                ['email', 'Email label'],
                ['emailPlaceholder', 'Email example'],
                ['organisation', 'Organisation label'],
                ['organisationPlaceholder', 'Organisation example'],
                ['propertyType', 'Property type label'],
                ['city', 'City label'],
                ['area', 'Area label'],
                ['message', 'Message label'],
                ['messagePlaceholder', 'Message example'],
                ['question', 'Question label'],
                ['questionPlaceholder', 'Question example'],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={label} value={c.form.labels[k]} onChange={(v) => upd('form', { labels: { ...c.form.labels, [k]: v } })} />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Google search listing" hint="Page title and description for search results" {...sec('seo')}>
        <Field label="Page title" value={c.seo.title} onChange={(v) => upd('seo', { title: v })} />
        <Area label="Description" rows={2} value={c.seo.description} onChange={(v) => upd('seo', { description: v })} hint={`${c.seo.description.length} characters (aim for 120-160)`} />
      </Section>
    </div>
  );
};

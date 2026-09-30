import React from 'react';

/**
 * Tiny markdown renderer for blog content blocks (no dependency).
 * Supports: ## / ### headings, paragraphs, - and 1. lists, | tables |, > quotes,
 * **bold**, *italic*, [links](/internal-or-https) and ![caption](photo) images.
 */

export const headingId = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);

type Nav = (path: string) => void;

const IMG_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

const renderInline = (text: string, navigate: Nav, keyBase = ''): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[5]) {
      const label = m[6];
      const href = m[7];
      if (href.startsWith('/')) {
        out.push(
          <a
            key={k}
            href={href}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) return;
              e.preventDefault();
              navigate(href);
              window.scrollTo({ top: 0 });
            }}
            className="text-[#2D6A4F] font-semibold underline decoration-[#2D6A4F]/30 underline-offset-2 hover:decoration-[#2D6A4F]"
          >
            {renderInline(label, navigate, k)}
          </a>
        );
      } else {
        out.push(
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="text-[#2D6A4F] font-semibold underline underline-offset-2">
            {label}
          </a>
        );
      }
    } else if (m[1]) {
      out.push(
        <strong key={k} className="font-bold text-[#142B1A]">
          {renderInline(m[2], navigate, k)}
        </strong>
      );
    } else if (m[3]) {
      out.push(<em key={k}>{renderInline(m[4], navigate, k)}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

export const MarkdownBlock: React.FC<{ block: string; navigate: Nav }> = ({ block, navigate }) => {
  const text = block.trim();
  const lines = text.split('\n');

  // Photos: ![caption](url) on their own line; several lines = small gallery
  if (lines.every((l) => IMG_RE.test(l.trim()))) {
    const imgs = lines.map((l) => {
      const m = l.trim().match(IMG_RE)!;
      return { alt: m[1], src: m[2] };
    });
    if (imgs.length === 1) {
      return (
        <figure className="my-2">
          <img src={imgs[0].src} alt={imgs[0].alt} loading="lazy" className="w-full rounded-2xl border border-[#E5E2D9] object-cover" />
          {imgs[0].alt && <figcaption className="text-xs text-[#7A7A7A] text-center mt-2">{imgs[0].alt}</figcaption>}
        </figure>
      );
    }
    return (
      <div className={`grid gap-2 my-2 ${imgs.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {imgs.map((im, i) => (
          <figure key={i}>
            <img src={im.src} alt={im.alt} loading="lazy" className="w-full aspect-[4/3] rounded-xl border border-[#E5E2D9] object-cover" />
            {im.alt && <figcaption className="text-[11px] text-[#7A7A7A] text-center mt-1">{im.alt}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }
  if (text.startsWith('### ')) {
    const h = text.slice(4);
    return (
      <h3 id={headingId(h)} className="scroll-mt-28 font-editorial text-lg sm:text-xl font-bold text-[#142B1A] pt-2">
        {renderInline(h, navigate)}
      </h3>
    );
  }
  if (text.startsWith('## ')) {
    const h = text.slice(3);
    return (
      <h2 id={headingId(h)} className="scroll-mt-28 font-editorial text-xl sm:text-2xl font-extrabold text-[#142B1A] pt-4">
        {renderInline(h, navigate)}
      </h2>
    );
  }
  if (lines.every((l) => l.trim().startsWith('|'))) {
    const rows = lines.filter((l) => !/^\|?\s*:?-{2,}/.test(l.trim().replace(/^\|/, '')));
    const [head, ...body] = rows.map(splitRow);
    return (
      <div className="overflow-x-auto rounded-[20px] bg-[#FFF8F0] shadow-[0_14px_36px_-22px_rgba(19,48,27,0.45)] ring-1 ring-[#ECE3D3]">
        <table className="w-full border-collapse text-left text-xs sm:text-[15px]">
          <thead className="bg-[#13301B] text-white">
            <tr>
              {head.map((c, i) => (
                <th key={i} className={`px-4 sm:px-6 py-4 sm:py-5 font-serif text-sm sm:text-lg font-medium whitespace-nowrap ${i > 0 ? 'text-center border-l border-white/10' : ''}`}>
                  {renderInline(c, navigate, `h${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className="border-t border-[#EADFCD] align-middle">
                {r.map((c, ci) => (
                  <td key={ci} className={`px-4 sm:px-6 py-3.5 sm:py-4 text-[#4A4A4A] ${ci === 0 ? 'font-serif text-sm sm:text-base font-medium text-[#142B1A]' : 'text-center border-l border-[#EADFCD]'}`}>
                    {renderInline(c, navigate, `c${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
    return (
      <ul className="space-y-2 pl-1">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#2D6A4F] shrink-0" />
            <span>{renderInline(l.replace(/^\s*[-*]\s+/, ''), navigate, `l${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
    return (
      <ol className="space-y-2 pl-1">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#1F3B22] text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
            <span className="pt-0.5">{renderInline(l.replace(/^\s*\d+\.\s+/, ''), navigate, `o${i}`)}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (text.startsWith('> ')) {
    return (
      <blockquote className="border-l-4 border-[#2D6A4F] bg-[#F4F9F2] px-4 py-3 rounded-r-xl text-[#2E4A33]">
        {renderInline(text.replace(/^>\s?/gm, ''), navigate)}
      </blockquote>
    );
  }
  const isAnswer = /^\*\*(Quick answer|Short answer):\*\*/i.test(text);
  if (isAnswer) {
    return (
      <div className="bg-[#EBF5EC] border border-[#C5E1C9] rounded-2xl p-4 sm:p-5 text-[#23402A]">
        {renderInline(text, navigate)}
      </div>
    );
  }
  return <p>{renderInline(text, navigate)}</p>;
};

export const extractHeadings = (blocks: string[]) =>
  blocks.filter((b) => b.trim().startsWith('## ')).map((b) => {
    const t = b.trim().slice(3).replace(/\*\*/g, '');
    return { id: headingId(t), text: t };
  });

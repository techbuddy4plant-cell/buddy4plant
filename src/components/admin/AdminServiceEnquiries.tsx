import React, { useEffect, useMemo, useState } from 'react';
import { CloudOff, Inbox, Mail, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { EnquiryStatus, ServiceEnquiry, getServiceEnquiries, updateServiceEnquiryStatus } from '../../services/enquiryService';

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: 'bg-[#FFF4D6] text-[#8A5A00] border-[#F2D58A]',
  contacted: 'bg-[#E6F0FA] text-[#1F4E7A] border-[#B9D3EC]',
  closed: 'bg-[#EBF5EC] text-[#1F4522] border-[#C5E1C9]',
};

export const AdminServiceEnquiries: React.FC = () => {
  const [items, setItems] = useState<ServiceEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');

  const load = async () => {
    setLoading(true);
    setItems(await getServiceEnquiries());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      new: items.filter((i) => i.status === 'new').length,
      contacted: items.filter((i) => i.status === 'contacted').length,
      closed: items.filter((i) => i.status === 'closed').length,
    }),
    [items]
  );
  const shown = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const setStatus = async (id: string, status: EnquiryStatus) => {
    setItems((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
    await updateServiceEnquiryStatus(id, status);
  };

  const digits = (p: string) => {
    const d = p.replace(/\D/g, '');
    return d.length === 10 ? `91${d}` : d;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E2D9] p-5 sm:p-7 mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-[#141414] flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#2D6A4F]" /> Service Enquiries
          </h3>
          <p className="text-xs text-[#7A7A7A]">Requests sent from the Gardening Services page form.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DDD9CF] text-xs font-bold text-[#1F3B22] hover:bg-[#FAF9F5]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', 'new', 'contacted', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize border ${
              filter === f ? 'bg-[#1F3B22] text-white border-[#1F3B22]' : 'bg-white text-[#1F3B22] border-[#DDD9CF]'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#7A7A7A] py-8 text-center">Loading enquiries...</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-[#7A7A7A] py-8 text-center">No enquiries yet.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((e) => (
            <div key={e.id} className="rounded-2xl border border-[#E5E2D9] p-4 sm:p-5 bg-[#FDFCF9]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#141414]">{e.fullName}</span>
                    {e.organisation && <span className="text-xs text-[#5C5C5C]">· {e.organisation}</span>}
                    {!e.syncedToCloud && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A5A00]" title="Saved only in this browser">
                        <CloudOff className="w-3 h-3" /> local only
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A7A7A] mt-0.5">{new Date(e.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <select
                  value={e.status}
                  onChange={(ev) => setStatus(e.id, ev.target.value as EnquiryStatus)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLE[e.status]}`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[e.enquiryType, e.propertyType, e.city, e.area].filter(Boolean).map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-white border border-[#E5E2D9] text-[11px] font-semibold text-[#1F3B22]">
                    {t}
                  </span>
                ))}
              </div>
              {e.message && <p className="text-sm text-[#4A4A4A] mt-3 leading-relaxed">{e.message}</p>}
              <div className="flex flex-wrap gap-2 mt-4">
                <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1F3B22] text-white text-xs font-bold">
                  <Phone className="w-3.5 h-3.5" /> {e.phone}
                </a>
                <a
                  href={`https://wa.me/${digits(e.phone)}?text=${encodeURIComponent(`Hi ${e.fullName}, this is Buddy4Plant regarding your enquiry for ${e.enquiryType.toLowerCase()}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                {e.email && (
                  <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DDD9CF] text-xs font-bold text-[#1F3B22]">
                    <Mail className="w-3.5 h-3.5" /> {e.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

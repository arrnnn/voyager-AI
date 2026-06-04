'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Clock, Users, DollarSign, Hotel, Star,
  Lightbulb, Download, ChevronDown, ChevronUp,
  Bookmark, BookmarkCheck, MessageCircle, X,
  Send, Loader2, Plane, Train, Utensils, Info,
  Share2, Package
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const gold   = 'rgba(201,169,110,1)';
const goldDim = 'rgba(201,169,110,0.55)';
const goldBorder = 'rgba(201,169,110,0.2)';
const surface = 'rgba(15,12,8,0.65)';
const surfaceRaised = 'rgba(20,16,10,0.75)';
const text  = '#E8E2D9';
const textMuted = 'rgba(180,168,148,0.65)';
const displayFont = 'Cormorant Garamond, Georgia, serif';
const bodyFont = 'DM Sans, system-ui, sans-serif';

// ─── Chat-only keyframes injected once ───────────────────────────────────────
const CHAT_STYLES = `
@keyframes voy-orbit {
  from { transform: rotate(0deg) translateX(26px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(26px) rotate(-360deg); }
}
@keyframes voy-orbit2 {
  from { transform: rotate(180deg) translateX(22px) rotate(-180deg); }
  to   { transform: rotate(540deg) translateX(22px) rotate(-540deg); }
}
@keyframes voy-pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  70%  { transform: scale(1.55); opacity: 0; }
  100% { transform: scale(1.55); opacity: 0; }
}
@keyframes voy-scan {
  0%   { top: 0%; opacity: 0.7; }
  48%  { opacity: 0.7; }
  50%  { top: 100%; opacity: 0; }
  100% { top: 0%; opacity: 0; }
}
@keyframes voy-blink-dot {
  0%, 100% { opacity: 1; transform: scaleY(1); }
  50%       { opacity: 0.3; transform: scaleY(0.4); }
}
@keyframes voy-msg-in-ai {
  from { opacity: 0; transform: translateX(-10px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes voy-msg-in-user {
  from { opacity: 0; transform: translateX(10px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes voy-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes voy-wave {
  0%, 100% { height: 4px; }
  50%       { height: 18px; }
}
@keyframes voy-glow-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(201,169,110,0.2), 0 0 24px rgba(201,169,110,0.08); }
  50%       { box-shadow: 0 0 20px rgba(201,169,110,0.35), 0 0 40px rgba(201,169,110,0.15); }
}
@keyframes voy-btn-hover-glow {
  0%, 100% { box-shadow: inset 0 0 0 1px rgba(201,169,110,0.2), 0 4px 24px rgba(0,0,0,0.4); }
  50%       { box-shadow: inset 0 0 0 1px rgba(201,169,110,0.4), 0 4px 32px rgba(201,169,110,0.1); }
}
`;

function injectChatStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('voy-chat-styles')) return;
  const s = document.createElement('style');
  s.id = 'voy-chat-styles';
  s.textContent = CHAT_STYLES;
  document.head.appendChild(s);
}

// ─── Live AI Avatar ───────────────────────────────────────────────────────────
function AIAvatar({ size = 46, active = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Pulse ring */}
      {active && (
        <div style={{
          position: 'absolute', inset: -3,
          borderRadius: '50%',
          border: '1.5px solid rgba(201,169,110,0.5)',
          animation: 'voy-pulse-ring 1.8s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}
      {/* Orbiting particle 1 */}
      <div style={{
        position: 'absolute', inset: 0,
        animation: 'voy-orbit 3.2s linear infinite',
        pointerEvents: 'none',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 5, height: 5, borderRadius: '50%', background: gold, transform: 'translate(-50%,-50%)', boxShadow: `0 0 6px ${gold}` }} />
      </div>
      {/* Orbiting particle 2 */}
      <div style={{
        position: 'absolute', inset: 0,
        animation: 'voy-orbit2 4.8s linear infinite',
        pointerEvents: 'none',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 3, height: 3, borderRadius: '50%', background: 'rgba(201,169,110,0.5)', transform: 'translate(-50%,-50%)' }} />
      </div>
      {/* Core */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(25,20,12,0.95), rgba(15,12,8,0.98))',
        border: `1.5px solid ${goldBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        animation: active ? 'voy-glow-pulse 2s ease-in-out infinite' : 'none',
      }}>
        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
          animation: 'voy-scan 2.4s linear infinite',
          opacity: 0.6,
        }} />
        <span style={{
          fontFamily: displayFont,
          fontStyle: 'italic',
          fontSize: size * 0.3,
          color: gold,
          fontWeight: 400,
          letterSpacing: '0.06em',
          position: 'relative',
          zIndex: 1,
        }}>AI</span>
      </div>
      {/* Online dot */}
      <div style={{
        position: 'absolute', bottom: 1, right: 1,
        width: size * 0.22, height: size * 0.22, borderRadius: '50%',
        background: '#4ADE80',
        border: `2px solid rgba(10,8,5,0.95)`,
        boxShadow: '0 0 6px rgba(74,222,128,0.7)',
      }} />
    </div>
  );
}

// ─── Waveform typing indicator ────────────────────────────────────────────────
function WaveTyping() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 2px', height: 24 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 3, height: 4, borderRadius: 2,
          background: gold,
          opacity: 0.7,
          animation: `voy-wave 1s ease-in-out infinite`,
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Suggested quick prompts ──────────────────────────────────────────────────
function QuickPrompts({ destination, onSend }) {
  const prompts = [
    `Best time to visit ${destination}?`,
    'What visa do I need?',
    'Local currency tips?',
    'Hidden gems to explore?',
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px 0' }}>
      {prompts.map((p, i) => (
        <button key={i} onClick={() => onSend(p)}
          style={{
            padding: '5px 11px',
            background: 'rgba(201,169,110,0.06)',
            border: `1px solid ${goldBorder}`,
            borderRadius: 20,
            color: goldDim,
            fontSize: '0.7rem',
            fontFamily: bodyFont,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.12)'; e.currentTarget.style.color = gold; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; e.currentTarget.style.color = goldDim; e.currentTarget.style.borderColor = goldBorder; }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ─── Single chat message ──────────────────────────────────────────────────────
function ChatMessage({ msg, isLast }) {
  const isAI = msg.role === 'assistant';
  return (
    <div style={{
      display: 'flex', gap: 10,
      flexDirection: isAI ? 'row' : 'row-reverse',
      animation: isAI ? 'voy-msg-in-ai 0.3s ease both' : 'voy-msg-in-user 0.3s ease both',
    }}>
      {/* Avatar */}
      {isAI ? (
        <AIAvatar size={28} active={isLast} />
      ) : (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(201,169,110,0.12)',
          border: `1px solid ${goldBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: displayFont, fontStyle: 'italic', fontSize: '0.7rem', color: gold,
        }}>U</div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '76%',
        padding: '10px 14px',
        borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        fontSize: '0.83rem',
        lineHeight: 1.58,
        fontFamily: bodyFont,
        color: isAI ? text : '#0A0905',
        background: isAI
          ? 'rgba(22,17,11,0.85)'
          : `linear-gradient(135deg, rgba(201,169,110,0.88), rgba(168,132,74,0.92))`,
        border: isAI ? `1px solid ${goldBorder}` : 'none',
        backdropFilter: isAI ? 'blur(8px)' : 'none',
        position: 'relative',
        // Shimmer on last AI message
        ...(isAI && isLast ? {
          backgroundImage: 'linear-gradient(90deg, rgba(22,17,11,0.85) 0%, rgba(30,24,14,0.9) 40%, rgba(22,17,11,0.85) 80%)',
          backgroundSize: '200% 100%',
          animation: 'voy-shimmer 3s ease infinite',
        } : {}),
      }}>
        {msg.content}
      </div>
    </div>
  );
}

const SectionTitle = ({ icon: Icon, label, iconColor = gold }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
    <span style={{
      width: 30, height: 30,
      background: 'rgba(201,169,110,0.08)',
      border: `1px solid ${goldBorder}`,
      borderRadius: 7,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={13} color={iconColor} />
    </span>
    <h3 style={{ fontFamily: displayFont, fontWeight: 300, fontSize: '1.1rem', color: text, letterSpacing: '0.04em', margin: 0 }}>
      {label}
    </h3>
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: surfaceRaised, border: `1px solid ${goldBorder}`, borderRadius: 12, padding: '14px 16px', ...style }}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TripDetail({ trip, plan = {}, onExport, onSave }) {
  const [openDay, setOpenDay] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [saved, setSaved] = useState(trip?.saved || false);
  const [photos, setPhotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showPacking, setShowPacking] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your travel assistant for your ${trip?.destination} trip. Ask me anything about your plan, costs, visa, best time to visit, or local tips!` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHovered, setChatHovered] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const destination = trip?.destination || '';

  useEffect(() => { injectChatStyles(); }, []);

  useEffect(() => {
    if (!destination) return;
    fetch(`/api/photos?destination=${encodeURIComponent(destination)}`)
      .then(r => r.json())
      .then(data => { if (data.photos?.length) setPhotos(data.photos); })
      .catch(() => {});
  }, [destination]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  useEffect(() => {
    setSaved(trip?.saved || false);
  }, [trip?.id]);

  useEffect(() => {
    if (showChat) setTimeout(() => inputRef.current?.focus(), 120);
  }, [showChat]);

  if (!trip) return null;

  const itinerary     = plan?.itinerary       || (trip?.itinerary        ? JSON.parse(trip.itinerary)        : []);
  const budget        = plan?.budget_breakdown || (trip?.budget_breakdown ? JSON.parse(trip.budget_breakdown) : {});
  const budgetINR     = plan?.budget_breakdown_inr || {};
  const hotels        = plan?.hotels           || (trip?.hotels           ? JSON.parse(trip.hotels)           : []);
  const attractions   = plan?.attractions      || (trip?.attractions      ? JSON.parse(trip.attractions)      : []);
  const tips          = plan?.tips             || (trip?.tips             ? JSON.parse(trip.tips)             : []);
  const flights       = plan?.flights          || null;
  const foodGuide     = plan?.food_guide       || null;
  const localTransport = plan?.local_transport || null;
  const tripType      = trip?.tripType         || '';
  const isPro         = true;
  const budgetUSD     = plan?.budgetUSD        || trip?.budget;
  const budgetINRTotal = plan?.budgetINR       || (trip?.budget * 83);

  const packingList = plan?.packingList || (destination ? {
    essentials:   ['Passport', 'Travel insurance', 'Emergency cash', 'Medicines', 'Visa documents'],
    clothing:     ['Light comfortable clothes', 'Walking shoes', 'Swimwear', 'Rain jacket', 'Evening wear'],
    toiletries:   ['Sunscreen SPF 50', 'Insect repellent', 'Hand sanitizer', 'First aid kit', 'Lip balm'],
    electronics:  ['Travel adapter', 'Power bank', 'Camera', 'Earphones', 'Phone charger'],
    tripSpecific: [
      tripType === 'couples'   ? 'Romantic outfit for dinners'     :
      tripType === 'family'    ? 'Kids entertainment items'        :
      tripType === 'bachelors' ? 'Party clothes and accessories'   :
      tripType === 'solo'      ? 'Padlock for hostel lockers'      : 'Comfortable day bag',
      `${destination} travel guidebook`, 'Reusable water bottle',
    ]
  } : null);

  // ── Handlers (all original logic preserved) ──────────────────────────────
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id, photos: photos.length > 0 ? photos : [] }),
      });
      const data = await res.json();
      if (res.ok && data.html) {
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = data.filename;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link); URL.revokeObjectURL(url);
      }
    } catch (err) { console.error('Export error:', err); }
    finally { setIsExporting(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/save-trip', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id }),
      });
      const data = await res.json();
      if (res.ok) { setSaved(true); if (onSave) onSave(trip.id); }
      else if (res.status === 403) alert(data.error || 'Upgrade to Pro to save more trips!');
    } catch (err) { console.error('Save error:', err); }
    finally { setIsSaving(false); }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/share-trip', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id }),
      });
      const data = await res.json();
      if (res.ok && data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl);
        alert('Share link copied to clipboard!');
      } else if (res.status === 403) {
        alert('Sharing is a Pro feature. Upgrade to Pro to share trips!');
      }
    } catch (err) { console.error('Share error:', err); }
    finally { setIsSharing(false); }
  };

  const handleChat = async (overrideMsg) => {
    const userMsg = (typeof overrideMsg === 'string' && overrideMsg.length > 0) ? overrideMsg : chatInput.trim();
    if (!userMsg || isChatLoading) return;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          tripContext: { destination, budget: trip.budget, duration: trip.duration, travellers: trip.travellers, tripType: trip.tripType, itinerary, hotels, attractions, tips, budget_breakdown: budget, flights, foodGuide, localTransport, budgetINR: budgetINRTotal },
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not process that.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally { setIsChatLoading(false); }
  };

  // ── Action buttons ──────────────────────────────────────────────────────
  const ActionButtons = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {[
        { onClick: handleSave, disabled: isSaving || saved, label: isSaving ? 'Saving…' : saved ? 'Saved' : 'Save', icon: saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />, active: saved },
        { onClick: handleExport, disabled: isExporting, label: isExporting ? 'Exporting…' : 'Export', icon: <Download size={13} /> },
        { onClick: handleShare, disabled: isSharing, label: isSharing ? 'Copying…' : 'Share', icon: <Share2 size={13} />, purple: true },
      ].map((btn, i) => (
        <button key={i} onClick={btn.onClick} disabled={btn.disabled}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9,
            background: btn.active ? 'rgba(74,222,128,0.15)' : btn.purple ? 'rgba(167,139,250,0.12)' : 'rgba(0,0,0,0.45)',
            border: btn.active ? '1px solid rgba(74,222,128,0.3)' : btn.purple ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)', color: btn.active ? '#4ADE80' : '#E8E2D9',
            fontSize: '0.8rem', cursor: btn.disabled ? 'default' : 'pointer',
            opacity: btn.disabled && !btn.active ? 0.6 : 1, transition: 'all 0.2s',
          }}
        >{btn.icon} {btn.label}</button>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: surface, backdropFilter: 'blur(20px)', border: `1px solid ${goldBorder}`, borderRadius: 18, overflow: 'hidden' }}>

      {/* ── Photo Gallery ── */}
      {photos.length > 0 ? (
        <div>
          <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#080604' }}>
            <img src={photos[activePhoto]} alt={destination} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,4,2,0.9) 0%, rgba(5,4,2,0.2) 60%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
              <h2 style={{ fontFamily: displayFont, fontWeight: 300, fontSize: '2.2rem', color: '#F0EAE0', letterSpacing: '0.04em', textTransform: 'capitalize', marginBottom: 10 }}>{destination}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {flights?.from && <MetaChip icon={<Plane size={9}/>}>{flights.from} → {destination}</MetaChip>}
                <MetaChip icon={<Clock size={9}/>}>{trip.duration} days</MetaChip>
                <MetaChip icon={<DollarSign size={9}/>}>${budgetUSD} / ₹{budgetINRTotal?.toLocaleString('en-IN')}</MetaChip>
                <MetaChip icon={<Users size={9}/>}>{trip.travellers} pax</MetaChip>
                <MetaChip accent>{trip.tripType}</MetaChip>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 16 }}><ActionButtons /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'rgba(8,6,3,0.6)' }}>
            {photos.map((photo, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                style={{ flex: 1, height: 52, borderRadius: 8, overflow: 'hidden', border: `2px solid ${activePhoto === i ? '#C9A96E' : 'transparent'}`, opacity: activePhoto === i ? 1 : 0.45, cursor: 'pointer', transition: 'all 0.2s', padding: 0, background: 'none' }}
              >
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(15,12,8,0.9))', display: 'flex', alignItems: 'flex-end', padding: '0 24px 20px' }}>
          <div>
            <h2 style={{ fontFamily: displayFont, fontWeight: 300, fontSize: '2rem', color: '#F0EAE0', textTransform: 'capitalize', letterSpacing: '0.04em', marginBottom: 8 }}>{destination}</h2>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: textMuted }}>
              <span>{trip.duration} days</span><span>${budgetUSD}</span><span>{trip.travellers} pax</span>
              <span style={{ textTransform: 'capitalize' }}>{trip.tripType}</span>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 16, right: 16 }}><ActionButtons /></div>
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Flights */}
        {flights && (
          <section>
            <SectionTitle icon={Plane} label="Flight Information" iconColor="#60A5FA" />
            <Card style={{ background: 'rgba(96,165,250,0.06)', borderColor: 'rgba(96,165,250,0.18)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <InfoField label="Route" value={`${flights.from} → ${destination}`} />
                <InfoField label="Estimated Cost" value={`$${flights.estimatedCostUSD}`} sub={flights.estimatedCostINR ? `₹${flights.estimatedCostINR?.toLocaleString('en-IN')}` : null} />
                {flights.airlines?.length > 0 && <InfoField label="Airlines" value={flights.airlines.join(', ')} />}
                {flights.tips && <InfoField label="Booking Tip" value={flights.tips} muted />}
              </div>
            </Card>
          </section>
        )}

        {/* Budget */}
        {Object.keys(budget).length > 0 && (
          <section>
            <SectionTitle icon={DollarSign} label="Budget Breakdown" iconColor="#4ADE80" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 10 }}>
              {Object.entries(budget).map(([key, val]) => (
                <Card key={key} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: textMuted, textTransform: 'capitalize', marginBottom: 6 }}>{key}</div>
                  <div style={{ fontSize: '1.3rem', fontFamily: displayFont, fontWeight: 300, color: '#4ADE80' }}>${val}</div>
                  {budgetINR[key] && <div style={{ fontSize: '0.65rem', color: textMuted, marginTop: 3 }}>₹{budgetINR[key]?.toLocaleString('en-IN')}</div>}
                </Card>
              ))}
            </div>
            <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: textMuted }}>Total Budget</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: displayFont, fontSize: '1.2rem', fontWeight: 400, color: text }}>${budgetUSD}</span>
                <span style={{ fontSize: '0.75rem', color: textMuted, marginLeft: 8 }}>/ ₹{budgetINRTotal?.toLocaleString('en-IN')}</span>
              </div>
            </Card>
          </section>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <section>
            <SectionTitle icon={Clock} label="Day-by-Day Itinerary" iconColor="#60A5FA" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {itinerary.map((day, i) => (
                <div key={i} style={{ background: surfaceRaised, border: `1px solid ${openDay === i ? 'rgba(201,169,110,0.3)' : goldBorder}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.25s' }}>
                  <button onClick={() => setOpenDay(openDay === i ? -1 : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: `1px solid ${goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: displayFont, fontSize: '0.85rem', color: gold, flexShrink: 0 }}>{day.day}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: text, fontSize: '0.9rem' }}>{day.title}</div>
                        {day.theme && <div style={{ fontSize: '0.72rem', color: goldDim, marginTop: 2 }}>{day.theme}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {day.dailyTotal && <span style={{ fontSize: '0.72rem', color: '#4ADE80' }}>{day.dailyTotal}</span>}
                      {openDay === i ? <ChevronUp size={14} color={textMuted} /> : <ChevronDown size={14} color={textMuted} />}
                    </div>
                  </button>
                  {openDay === i && (
                    <div style={{ borderTop: `1px solid ${goldBorder}` }}>
                      {day.dayHighlight && (
                        <div style={{ margin: '14px 18px 0', padding: '10px 14px', background: 'rgba(201,169,110,0.07)', border: `1px solid rgba(201,169,110,0.18)`, borderRadius: 10 }}>
                          <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: goldDim, marginBottom: 4 }}>Today's Highlight</div>
                          <div style={{ fontSize: '0.85rem', color: '#E8E2D9' }}>{day.dayHighlight}</div>
                        </div>
                      )}
                      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, marginBottom: 4 }}>Activities</div>
                        {Array.isArray(day.activities) && day.activities.map((act, j) => {
                          const isObj = typeof act === 'object' && act !== null;
                          return (
                            <div key={j} style={{ display: 'flex', gap: 10, background: 'rgba(20,16,10,0.55)', borderRadius: 10, padding: '10px 14px', border: `1px solid rgba(201,169,110,0.08)` }}>
                              {isObj && act.time && <div style={{ flexShrink: 0 }}><span style={{ fontSize: '0.7rem', color: '#60A5FA', background: 'rgba(96,165,250,0.1)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>{act.time}</span></div>}
                              <div style={{ flex: 1 }}>
                                {isObj ? (
                                  <>
                                    <div style={{ fontWeight: 500, color: text, fontSize: '0.875rem' }}>{act.place}</div>
                                    {act.description && <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: 5, lineHeight: 1.55 }}>{act.description}</div>}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                                      {act.duration && <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(201,169,110,0.08)', color: goldDim }}>{act.duration}</span>}
                                      {act.cost && <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>{act.cost}</span>}
                                    </div>
                                    {act.tips && <div style={{ fontSize: '0.72rem', color: '#F6A84B', marginTop: 6, fontStyle: 'italic' }}>Tip: {act.tips}</div>}
                                  </>
                                ) : (
                                  <div style={{ fontSize: '0.85rem', color: textMuted, lineHeight: 1.55 }}>{act}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {(day.breakfast || day.lunch || day.dinner) && (
                        <div style={{ padding: '0 18px 14px' }}>
                          <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, marginBottom: 8 }}>Meals</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {[
                              { label: 'Breakfast', data: day.breakfast, color: '#FCD34D', bg: 'rgba(252,211,77,0.07)', border: 'rgba(252,211,77,0.18)' },
                              { label: 'Lunch', data: day.lunch, color: '#F6A84B', bg: 'rgba(246,168,75,0.07)', border: 'rgba(246,168,75,0.18)' },
                              { label: 'Dinner', data: day.dinner, color: '#F08080', bg: 'rgba(240,128,128,0.07)', border: 'rgba(240,128,128,0.18)' },
                            ].map(({ label, data, color, bg, border }) => data && (
                              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: '10px 12px' }}>
                                <div style={{ fontSize: '0.62rem', color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                                <div style={{ fontSize: '0.8rem', color: text, fontWeight: 500 }}>{data.place}</div>
                                <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: 2 }}>{data.dish}</div>
                                <div style={{ fontSize: '0.72rem', color: '#4ADE80', marginTop: 4 }}>{data.cost}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(day.accommodation || day.transport) && (
                        <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {day.accommodation && (
                            <div style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 9, padding: '10px 12px' }}>
                              <div style={{ fontSize: '0.62rem', color: '#A78BFA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Stay</div>
                              <div style={{ fontSize: '0.78rem', color: textMuted, lineHeight: 1.4 }}>{day.accommodation}</div>
                            </div>
                          )}
                          {day.transport && (
                            <div style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', borderRadius: 9, padding: '10px 12px' }}>
                              <div style={{ fontSize: '0.62rem', color: '#22D3EE', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Transport</div>
                              <div style={{ fontSize: '0.78rem', color: textMuted, lineHeight: 1.4 }}>{day.transport}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <section>
            <SectionTitle icon={Hotel} label="Recommended Hotels" iconColor="#A78BFA" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {hotels.map((hotel, i) => (
                <Card key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 500, color: text, fontSize: '0.875rem' }}>{hotel.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FCD34D', fontSize: '0.72rem', flexShrink: 0, marginLeft: 8 }}>
                      <Star size={10} fill="currentColor" />{hotel.rating}
                    </div>
                  </div>
                  {hotel.area && <div style={{ fontSize: '0.72rem', color: textMuted, marginBottom: 7 }}>{hotel.area}</div>}
                  <div style={{ fontSize: '0.9rem', fontFamily: displayFont, color: '#4ADE80' }}>
                    ${hotel.price}/night
                    {hotel.priceINR && <span style={{ fontSize: '0.72rem', color: textMuted, marginLeft: 6 }}>₹{hotel.priceINR?.toLocaleString('en-IN')}</span>}
                  </div>
                  {hotel.description && <div style={{ fontSize: '0.75rem', color: textMuted, marginTop: 6, lineHeight: 1.5 }}>{hotel.description}</div>}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Local Transport */}
        {localTransport && (
          <section>
            <SectionTitle icon={Train} label="Local Transport" iconColor="#22D3EE" />
            <Card>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {localTransport.options?.map((opt, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)', fontSize: '0.75rem', color: '#22D3EE' }}>{opt}</span>
                ))}
              </div>
              <div style={{ fontSize: '0.82rem', color: textMuted }}>
                Daily cost: <span style={{ color: text, fontWeight: 500 }}>${localTransport.estimatedDailyCostUSD}</span>
                {localTransport.estimatedDailyCostINR && <span style={{ color: textMuted, marginLeft: 6, fontSize: '0.75rem' }}>/ ₹{localTransport.estimatedDailyCostINR?.toLocaleString('en-IN')}</span>}
              </div>
              {localTransport.tips && <div style={{ fontSize: '0.75rem', color: textMuted, marginTop: 8 }}>{localTransport.tips}</div>}
            </Card>
          </section>
        )}

        {/* Food Guide */}
        {foodGuide && (
          <section>
            <SectionTitle icon={Utensils} label="Food Guide" iconColor="#F6A84B" />
            <Card>
              {foodGuide.mustTry?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, marginBottom: 7 }}>Must Try</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {foodGuide.mustTry.map((dish, i) => (
                      <span key={i} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(246,168,75,0.08)', border: '1px solid rgba(246,168,75,0.2)', fontSize: '0.75rem', color: '#F6A84B' }}>{dish}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ fontSize: '0.82rem', color: textMuted, marginBottom: 8 }}>
                Avg meal: <span style={{ color: text }}>${foodGuide.avgMealCostUSD}</span>
                {foodGuide.avgMealCostINR && <span style={{ color: textMuted, marginLeft: 6, fontSize: '0.75rem' }}>/ ₹{foodGuide.avgMealCostINR?.toLocaleString('en-IN')}</span>}
              </div>
              {foodGuide.restaurants?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {foodGuide.restaurants.map((r, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(201,169,110,0.06)', border: `1px solid ${goldBorder}`, fontSize: '0.75rem', color: textMuted }}>{r}</span>
                  ))}
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Attractions */}
        {attractions.length > 0 && (
          <section>
            <SectionTitle icon={MapPin} label="Top Attractions" iconColor="#F08080" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {attractions.map((att, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 500, color: text, fontSize: '0.875rem', marginBottom: 8 }}>{att.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 7 }}>
                    <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(201,169,110,0.06)', border: `1px solid ${goldBorder}`, fontSize: '0.65rem', color: textMuted }}>{att.distance}</span>
                    <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', fontSize: '0.65rem', color: '#4ADE80' }}>{att.entry_fee}</span>
                    <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', fontSize: '0.65rem', color: '#60A5FA' }}>{att.best_time}</span>
                    {att.duration && <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.18)', fontSize: '0.65rem', color: '#A78BFA' }}>{att.duration}</span>}
                  </div>
                  {att.tips && <div style={{ fontSize: '0.72rem', color: textMuted, fontStyle: 'italic' }}>{att.tips}</div>}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Visa / Currency / Best Time */}
        {(plan?.visa || plan?.currency || plan?.bestTimeToVisit) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 10 }}>
            {plan.visa && <Card><InfoField label="Visa" icon={<Info size={10}/>} value={plan.visa} /></Card>}
            {plan.currency && <Card><InfoField label="Currency" icon={<DollarSign size={10}/>} value={plan.currency} /></Card>}
            {plan.bestTimeToVisit && <Card><InfoField label="Best Time" icon={<Clock size={10}/>} value={plan.bestTimeToVisit} /></Card>}
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <section>
            <SectionTitle icon={Lightbulb} label="Travel Tips" iconColor="#FCD34D" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, background: surfaceRaised, borderRadius: 10, padding: '10px 14px', border: `1px solid ${goldBorder}` }}>
                  <span style={{ color: '#FCD34D', fontWeight: 600, flexShrink: 0, fontSize: '0.8rem' }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.85rem', color: textMuted, lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Packing List */}
        <div style={{ background: surfaceRaised, border: `1px solid ${goldBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          <button type="button"
            onClick={() => { if (!isPro) { window.location.href = '/pricing'; return; } setShowPacking(p => !p); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 9, margin: 0, fontFamily: displayFont, fontWeight: 300, fontSize: '1.05rem', color: text }}>
              <Package size={14} color="#4ADE80" /> Packing List
              {!isPro && <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(252,211,77,0.1)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)' }}>Pro Only</span>}
            </h3>
            {isPro ? (showPacking ? <ChevronUp size={14} color={textMuted} /> : <ChevronDown size={14} color={textMuted} />) : (
              <span style={{ fontSize: '0.72rem', color: '#FCD34D' }}>Click to upgrade</span>
            )}
          </button>
          {isPro && showPacking && packingList && (
            <div style={{ borderTop: `1px solid ${goldBorder}`, padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 16 }}>
              {Object.entries(packingList).map(([cat, items]) =>
                Array.isArray(items) && items.length > 0 ? (
                  <div key={cat}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: goldDim, marginBottom: 8 }}>{cat.replace(/([A-Z])/g, ' $1')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.78rem', color: textMuted }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', flexShrink: 0, marginTop: 5 }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Return Journey */}
        {plan?.returnJourney && (
          <section>
            <SectionTitle icon={Plane} label="Return Journey" iconColor="#4ADE80" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 8 }}>
              {plan.returnJourney.airportTransfer && <Card><InfoField label="Airport Transfer" value={plan.returnJourney.airportTransfer} /></Card>}
              {plan.returnJourney.airportArrival && <Card><InfoField label="Arrive at Airport" value={plan.returnJourney.airportArrival} /></Card>}
              {plan.returnJourney.checkoutTime && <Card><InfoField label="Hotel Checkout" value={plan.returnJourney.checkoutTime} /></Card>}
              {plan.returnJourney.dutyFree && <Card><InfoField label="Duty Free" value={plan.returnJourney.dutyFree} /></Card>}
              {plan.returnJourney.customsTips && <Card style={{ gridColumn: 'span 2' }}><InfoField label="Customs on Return" value={plan.returnJourney.customsTips} /></Card>}
              {plan.returnJourney.tips && (
                <div style={{ gridColumn: 'span 2', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 10, padding: '10px 14px' }}>
                  <InfoField label="Return Tips" value={plan.returnJourney.tips} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Emergency */}
        {plan?.emergency && (
          <div style={{ background: 'rgba(240,128,128,0.06)', border: '1px solid rgba(240,128,128,0.2)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F08080', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Info size={10} /> Emergency Info
            </div>
            <div style={{ fontSize: '0.85rem', color: textMuted }}>{plan.emergency}</div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ── UPGRADED AI CHAT BUTTON ──
        ══════════════════════════════════════════════════════════════════ */}
        <button
          type="button"
          onClick={() => {
            setShowChat(p => {
              const next = !p;
              if (next) setTimeout(() => document.getElementById('voy-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
              return next;
            });
          }}
          onMouseEnter={() => setChatHovered(true)}
          onMouseLeave={() => setChatHovered(false)}
          style={{
            width: '100%',
            border: `1px solid ${chatHovered || showChat ? 'rgba(201,169,110,0.38)' : goldBorder}`,
            borderRadius: 16,
            background: chatHovered || showChat
              ? 'rgba(201,169,110,0.07)'
              : 'rgba(15,12,8,0.7)',
            backdropFilter: 'blur(16px)',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s ease',
            boxShadow: chatHovered || showChat
              ? '0 0 0 1px rgba(201,169,110,0.15), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,169,110,0.08)'
              : '0 4px 20px rgba(0,0,0,0.3)',
            animation: showChat ? 'voy-btn-hover-glow 2.5s ease-in-out infinite' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px' }}>
            {/* Left: avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <AIAvatar size={48} active={chatHovered || showChat} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: displayFont,
                  fontWeight: 300,
                  fontSize: '1.1rem',
                  color: text,
                  letterSpacing: '0.04em',
                  marginBottom: 3,
                }}>
                  Voyager AI Assistant
                </div>
                <div style={{ fontSize: '0.72rem', color: goldDim, textTransform: 'capitalize', marginBottom: 6 }}>
                  {destination} Travel Expert
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {/* Live green dot */}
                  <div style={{ position: 'relative', width: 7, height: 7 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#4ADE80', animation: 'voy-pulse-ring 1.8s ease-out infinite' }} />
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', position: 'relative' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#4ADE80', letterSpacing: '0.06em' }}>Online · Ready to assist</span>
                </div>
              </div>
            </div>
            {/* Right: icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(201,169,110,0.1)',
              border: `1px solid ${goldBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              transform: chatHovered ? 'scale(1.08) rotate(-8deg)' : 'scale(1) rotate(0deg)',
            }}>
              {showChat
                ? <X size={16} color={gold} />
                : <MessageCircle size={16} color={gold} />}
            </div>
          </div>
        </button>

        {/* ══════════════════════════════════════════════════════════════════
            ── UPGRADED CHAT PANEL ──
        ══════════════════════════════════════════════════════════════════ */}
        {showChat && (
          <div id="voy-chat" style={{
            borderRadius: 16,
            border: `1px solid ${goldBorder}`,
            overflow: 'hidden',
            background: 'rgba(10,8,5,0.92)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,169,110,0.08)',
          }}>

            {/* Header */}
            <div style={{
              padding: '16px 18px',
              background: 'rgba(15,12,8,0.85)',
              borderBottom: `1px solid ${goldBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AIAvatar size={38} active={isChatLoading} />
                <div>
                  <div style={{ fontFamily: displayFont, fontWeight: 300, fontSize: '1rem', color: text, letterSpacing: '0.04em' }}>
                    Voyager AI
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {isChatLoading ? (
                      <>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: gold, animation: 'voy-pulse-ring 1s ease-out infinite' }} />
                        <span style={{ fontSize: '0.65rem', color: goldDim, letterSpacing: '0.08em' }}>Thinking…</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 5px rgba(74,222,128,0.7)' }} />
                        <span style={{ fontSize: '0.65rem', color: '#4ADE80', letterSpacing: '0.08em' }}>Online · {destination} Expert</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowChat(false)}
                style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(201,169,110,0.06)', border: `1px solid ${goldBorder}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: goldDim, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.12)'; e.currentTarget.style.color = gold; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; e.currentTarget.style.color = goldDim; }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick prompts — shown only before user has typed */}
            {messages.length === 1 && (
              <QuickPrompts destination={destination} onSend={handleChat} />
            )}

            {/* Messages */}
            <div
              style={{ height: 300, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}
              onClick={e => e.stopPropagation()}
            >
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} isLast={i === messages.length - 1 && msg.role === 'assistant'} />
              ))}

              {/* Waveform typing indicator */}
              {isChatLoading && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <AIAvatar size={28} active />
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '4px 14px 14px 14px',
                    background: 'rgba(22,17,11,0.85)',
                    border: `1px solid ${goldBorder}`,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <WaveTyping />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input row */}
            <div style={{ padding: '10px 14px 12px', borderTop: `1px solid ${goldBorder}`, background: 'rgba(12,10,6,0.6)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={e => { e.stopPropagation(); setChatInput(e.target.value); }}
                  onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  placeholder={`Ask about ${destination}…`}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(20,16,10,0.75)',
                    border: `1px solid ${goldBorder}`,
                    borderRadius: 10,
                    color: text,
                    fontSize: '0.85rem',
                    fontFamily: bodyFont,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocusCapture={e => {
                    e.target.style.borderColor = 'rgba(201,169,110,0.45)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.06)';
                  }}
                  onBlurCapture={e => {
                    e.target.style.borderColor = goldBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleChat(); }}
                  disabled={isChatLoading || !chatInput.trim()}
                  style={{
                    width: 40, height: 40, flexShrink: 0,
                    background: chatInput.trim() && !isChatLoading
                      ? `linear-gradient(135deg, rgba(201,169,110,0.9), rgba(168,132,74,0.9))`
                      : 'rgba(201,169,110,0.08)',
                    border: `1px solid ${chatInput.trim() && !isChatLoading ? 'rgba(201,169,110,0.5)' : goldBorder}`,
                    borderRadius: 10,
                    cursor: isChatLoading || !chatInput.trim() ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isChatLoading || !chatInput.trim() ? 0.4 : 1,
                    transition: 'all 0.2s',
                    transform: chatInput.trim() && !isChatLoading ? 'scale(1)' : 'scale(0.95)',
                  }}
                  onMouseEnter={e => { if (chatInput.trim() && !isChatLoading) e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = chatInput.trim() && !isChatLoading ? 'scale(1)' : 'scale(0.95)'; }}
                >
                  <Send size={15} color={chatInput.trim() && !isChatLoading ? '#0A0905' : goldDim} />
                </button>
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(180,168,148,0.3)', textAlign: 'center', marginTop: 8, letterSpacing: '0.08em' }}>
                Powered by Groq AI · Context-aware for {destination}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Small helper components ──────────────────────────────────────────────────
function MetaChip({ children, icon, accent }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: accent ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.45)',
      border: accent ? '1px solid rgba(201,169,110,0.3)' : '1px solid rgba(255,255,255,0.1)',
      color: accent ? '#C9A96E' : 'rgba(220,210,190,0.85)',
      padding: '2px 9px', borderRadius: 20,
      fontSize: '0.7rem', backdropFilter: 'blur(6px)',
      textTransform: 'capitalize',
    }}>
      {icon}{children}
    </span>
  );
}

function InfoField({ label, value, sub, muted, icon }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: 'rgba(180,168,148,0.5)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: '0.85rem', color: muted ? 'rgba(180,168,148,0.65)' : '#E8E2D9', lineHeight: 1.45 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'rgba(180,168,148,0.4)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
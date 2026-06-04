'use client';

import { useEffect, useState } from 'react';
import TripDetail from '@/components/TripDetail';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MapPin, Trash2, BookmarkCheck, X, TrendingUp } from 'lucide-react';

// ─── Same rotating background as dashboard ────────────────────────────────────
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80&auto=format&fit=crop',
];

function RotatingBackground() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % BG_IMAGES.length); setFade(true); }, 800);
    }, 8000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: -3, backgroundImage: `url(${BG_IMAGES[idx]})`, backgroundSize: 'cover', backgroundPosition: 'center 40%', backgroundAttachment: 'fixed', opacity: fade ? 1 : 0, transition: 'opacity 0.8s ease' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: -2, background: 'linear-gradient(180deg,rgba(5,4,2,0.72) 0%,rgba(8,6,3,0.84) 50%,rgba(10,8,4,0.92) 100%)' }} />
    </>
  );
}

// ─── Trip list item ───────────────────────────────────────────────────────────
function TripListItem({ trip, selected, onClick, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const date = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px',
        borderRadius: 14,
        border: `1px solid ${selected ? 'rgba(201,169,110,0.45)' : hovered ? 'rgba(201,169,110,0.22)' : 'rgba(201,169,110,0.12)'}`,
        background: selected
          ? 'rgba(201,169,110,0.1)'
          : hovered
          ? 'rgba(201,169,110,0.05)'
          : 'rgba(15,12,8,0.6)',
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
        boxShadow: selected ? '0 0 0 1px rgba(201,169,110,0.15), 0 4px 20px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Destination */}
        <div style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontWeight: selected ? 400 : 300,
          fontSize: '1.05rem',
          color: selected ? '#F0EAE0' : '#E8E2D9',
          textTransform: 'capitalize',
          letterSpacing: '0.03em',
          marginBottom: 6,
          lineHeight: 1.1,
        }}>
          {trip.destination}
        </div>
        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {[
            trip.duration && `${trip.duration}d`,
            trip.budget && `$${trip.budget}`,
            trip.tripType,
          ].filter(Boolean).map((m, i) => (
            <span key={i} style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
              color: selected ? 'rgba(201,169,110,0.8)' : 'rgba(180,168,148,0.55)',
              textTransform: 'capitalize',
            }}>{m}</span>
          ))}
        </div>
        {date && (
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', color: 'rgba(180,168,148,0.35)', marginTop: 5, letterSpacing: '0.06em' }}>
            {date}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(trip.id); }}
        style={{
          width: 28, height: 28, flexShrink: 0,
          background: 'transparent',
          border: '1px solid rgba(200,60,60,0.15)',
          borderRadius: 7,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(240,128,128,0.4)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,40,40,0.12)'; e.currentTarget.style.color = '#F08080'; e.currentTarget.style.borderColor = 'rgba(200,60,60,0.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(240,128,128,0.4)'; e.currentTarget.style.borderColor = 'rgba(200,60,60,0.15)'; }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/history?saved=true');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
        if (data.trips?.length) setSelectedTrip(data.trips[0]);
      }
    } catch { setError('Failed to load trips'); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (tripId) => {
    try {
      const res = await fetch('/api/delete-trip', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });
      if (res.ok) {
        const updated = trips.filter(t => t.id !== tripId);
        setTrips(updated);
        if (selectedTrip?.id === tripId) setSelectedTrip(updated[0] || null);
      }
    } catch { setError('Failed to delete'); }
  };

  const handleExport = async (tripId) => {
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
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
    } catch { setError('Failed to export'); }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <RotatingBackground />
      <LoadingSpinner />
    </div>
  );

  return (
    <>
      <RotatingBackground />

      <div style={{ padding: '32px 24px 80px', maxWidth: 1320, margin: '0 auto' }} className="animate-fadeUp">

        {/* ── Page Hero ── */}
        <div style={{ marginBottom: 36 }}>
          <p className="label-tag" style={{ marginBottom: 8 }}>Voyager AI</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            letterSpacing: '0.04em',
            color: '#F0EAE0',
            lineHeight: 1.05,
            marginBottom: 8,
          }}>
            Saved <em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Journeys</em>
          </h1>
          <p style={{ color: 'rgba(180,168,148,0.6)', fontSize: '0.88rem', letterSpacing: '0.02em' }}>
            {trips.length} saved trip{trips.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="animate-fadeIn" style={{
            marginBottom: 20, padding: '13px 16px',
            background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(200,60,60,0.25)',
            borderRadius: 12, color: '#F0A0A0', fontSize: '0.875rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F0A0A0', display: 'flex', padding: 4 }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {trips.length === 0 ? (
          <div className="glass" style={{ borderRadius: 20, padding: '72px 36px', textAlign: 'center' }}>
            <BookmarkCheck size={40} style={{ margin: '0 auto 16px', opacity: 0.12, color: '#C9A96E', display: 'block' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, color: '#E8E2D9', marginBottom: 8 }}>
              No saved journeys yet
            </p>
            <p style={{ fontSize: '0.83rem', color: 'rgba(180,168,148,0.5)', marginBottom: 24 }}>
              Generate a trip and tap Save to keep it here
            </p>
            <a href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 28px',
              background: 'linear-gradient(135deg,#C9A96E,#A8844A)',
              color: '#0D0B07', fontWeight: 600, fontSize: '0.75rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: 10,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Plan a new trip →
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>

            {/* ── Trip list ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'sticky', top: 88 }}>
              {/* List header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 7 }}>
                  <TrendingUp size={13} color="#C9A96E" />
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.1rem', color: '#E8E2D9', letterSpacing: '0.04em', margin: 0 }}>
                  Your Trips
                </h2>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '0.58rem', letterSpacing: '0.1em',
                  padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(201,169,110,0.1)',
                  border: '1px solid rgba(201,169,110,0.2)',
                  color: 'rgba(201,169,110,0.7)',
                }}>
                  {trips.length}
                </span>
              </div>

              {/* List items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trips.map(trip => (
                  <TripListItem
                    key={trip.id}
                    trip={trip}
                    selected={selectedTrip?.id === trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Back link */}
              <a href="/dashboard" style={{
                display: 'block', textAlign: 'center',
                marginTop: 20, padding: '10px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.5)', textDecoration: 'none',
                border: '1px solid rgba(201,169,110,0.1)', borderRadius: 10,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C9A96E'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)'; e.currentTarget.style.background = 'rgba(201,169,110,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,169,110,0.5)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.1)'; e.currentTarget.style.background = 'transparent'; }}
              >
                ← Plan a new trip
              </a>
            </div>

            {/* ── Trip detail ── */}
            <div>
              {selectedTrip ? (
                <div className="animate-fadeUp">
                  {/* Section heading */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 7 }}>
                      <MapPin size={13} color="#7EC8A0" />
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.1rem', color: '#E8E2D9', letterSpacing: '0.04em', margin: 0, textTransform: 'capitalize' }}>
                      {selectedTrip.destination}
                    </h2>
                  </div>
                  <TripDetail
                    trip={selectedTrip}
                    plan={null}
                    onExport={handleExport}
                    onSave={() => {}}
                  />
                </div>
              ) : (
                <div className="glass" style={{ borderRadius: 20, padding: '72px 36px', textAlign: 'center' }}>
                  <MapPin size={36} style={{ margin: '0 auto 14px', opacity: 0.12, color: '#C9A96E', display: 'block' }} />
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 300, color: '#E8E2D9' }}>
                    Select a trip to view details
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Mobile responsive ── */}
      <style>{`
        @media (max-width: 768px) {
          .trips-grid { grid-template-columns: 1fr !important; }
          .trips-list { position: static !important; }
        }
      `}</style>
    </>
  );
}
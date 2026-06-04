'use client';

import { useEffect, useState, useCallback } from 'react';
import TravelForm from '@/components/TravelForm';
import TripCard from '@/components/TripCard';
import TripDetail from '@/components/TripDetail';
import UsageCard from '@/components/UsageCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MapPin, Compass, BookmarkCheck, Lightbulb, X, TrendingUp } from 'lucide-react';

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

function SectionHeading({ icon: Icon, label, color = '#C9A96E' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.2rem', color: '#E8E2D9', letterSpacing: '0.04em', margin: 0 }}>{label}</h2>
    </div>
  );
}

function Tip({ children, index }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0' }}>
      <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600, color: '#C9A96E', marginTop: 1 }}>{index + 1}</span>
      <span style={{ fontSize: '0.83rem', color: 'rgba(200,190,170,0.75)', lineHeight: 1.55 }}>{children}</span>
    </li>
  );
}

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [usage, setUsage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [currentTrip, setCurrentTrip] = useState(() => {
    if (typeof window !== 'undefined') { const s = sessionStorage.getItem('currentTrip'); return s ? JSON.parse(s) : null; }
    return null;
  });
  const [currentPlan, setCurrentPlan] = useState(() => {
    if (typeof window !== 'undefined') { const s = sessionStorage.getItem('currentPlan'); return s ? JSON.parse(s) : null; }
    return null;
  });

  const fetchData = useCallback(async () => {
    try {
      const [hRes, uRes] = await Promise.all([fetch('/api/history'), fetch('/api/usage')]);
      if (hRes.ok) { const d = await hRes.json(); setTrips(d.trips || []); }
      if (uRes.ok) { const d = await uRes.json(); setUsage(d); sessionStorage.setItem('userPlan', d.plan || 'free'); }
    } catch { setError('Failed to load data'); } finally { setIsLoadingData(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      sessionStorage.removeItem('userPlan');
      await fetch('/api/auth/sync');
      fetchData();
      if (window.location.search.includes('upgraded=true')) window.history.replaceState({}, '', '/dashboard');
    };
    init();
  }, [fetchData]);

  const handleGenerate = async (formData) => {
    setIsLoading(true); setError('');
    setCurrentTrip(null); setCurrentPlan(null);
    sessionStorage.removeItem('currentTrip'); sessionStorage.removeItem('currentPlan');
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to generate trip'); return; }
      setCurrentTrip(data.trip); setCurrentPlan(data.plan);
      sessionStorage.setItem('currentTrip', JSON.stringify(data.trip));
      sessionStorage.setItem('currentPlan', JSON.stringify(data.plan));
      setTrips(prev => [data.trip, ...prev]);
      setUsage(prev => prev ? { ...prev, used: prev.used + 1 } : prev);
      setTimeout(() => document.getElementById('trip-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch { setError('Something went wrong. Please try again.'); } finally { setIsLoading(false); }
  };

  const handleDelete = async (tripId) => {
    try {
      const res = await fetch('/api/delete-trip', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripId }) });
      if (res.ok) {
        setTrips(prev => prev.filter(t => t.id !== tripId));
        if (currentTrip?.id === tripId) { setCurrentTrip(null); setCurrentPlan(null); sessionStorage.removeItem('currentTrip'); sessionStorage.removeItem('currentPlan'); }
      }
    } catch { setError('Failed to delete trip'); }
  };

  const handleExport = async (tripId) => {
    try {
      const res = await fetch('/api/export-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripId }) });
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

  const handleSave = (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, saved: true } : t));
    if (currentTrip?.id === tripId) {
      const updated = { ...currentTrip, saved: true };
      setCurrentTrip(updated); sessionStorage.setItem('currentTrip', JSON.stringify(updated));
    }
  };

  const viewTrip = (trip) => {
    setCurrentTrip(trip); setCurrentPlan(null);
    sessionStorage.setItem('currentTrip', JSON.stringify(trip));
    sessionStorage.removeItem('currentPlan');
    setTimeout(() => document.getElementById('trip-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  if (isLoadingData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <RotatingBackground /><LoadingSpinner />
    </div>
  );

  return (
    <>
      <style>{`
        .dash-page { padding: 32px 24px 80px; max-width: 1320px; margin: 0 auto; }
        .dash-hero  { margin-bottom: 36px; }
        .dash-hero h1 { font-family:var(--font-display); font-weight:300; font-size:clamp(2rem,5vw,3.4rem); letter-spacing:0.04em; color:#F0EAE0; line-height:1.05; margin-bottom:8px; }
        .dash-hero p  { color:rgba(180,168,148,0.7); font-size:0.9rem; }

        /* Two-col on desktop, single-col on mobile */
        .dash-grid { display:grid; grid-template-columns:1fr 300px; gap:28px; align-items:start; }
        .dash-left  { display:flex; flex-direction:column; gap:24px; }
        .dash-right { display:flex; flex-direction:column; gap:18px; position:sticky; top:88px; }

        .dash-form-card { border-radius:20px; padding:28px 28px; }
        .dash-empty    { border-radius:20px; padding:52px 28px; text-align:center; }

        /* Mobile overrides */
        @media (max-width: 768px) {
          .dash-page { padding: 72px 16px 80px; } /* top pad for hamburger */
          .dash-hero h1 { font-size: 1.9rem; }
          .dash-grid { grid-template-columns: 1fr; gap: 20px; }
          .dash-right { position: static; } /* unstick on mobile */
          .dash-form-card { padding: 20px 18px; border-radius: 16px; }
          .dash-empty { padding: 40px 20px; }
        }

        @media (max-width: 480px) {
          .dash-page { padding: 68px 12px 72px; }
          .dash-form-card { padding: 16px 14px; }
        }
      `}</style>

      <RotatingBackground />

      <div className="dash-page animate-fadeUp">

        {/* Hero */}
        <div className="dash-hero">
          <p className="label-tag" style={{ marginBottom: 8 }}>Voyager AI</p>
          <h1>
            Plan your next<br />
            <em style={{ fontStyle: 'italic', color: '#C9A96E' }}>extraordinary journey</em>
          </h1>
          <p>Describe your dream trip — AI will craft every detail</p>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fadeIn" style={{ marginBottom: 20, padding: '13px 16px', background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: 12, color: '#F0A0A0', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F0A0A0', display: 'flex', padding: 4 }}><X size={16} /></button>
          </div>
        )}

        <div className="dash-grid">

          {/* Left */}
          <div className="dash-left">

            {/* Form */}
            <div className="glass glow-gold dash-form-card">
              <SectionHeading icon={Compass} label="Plan a New Trip" />
              <div className="divider-gold" style={{ marginBottom: 24 }} />
              <TravelForm onSubmit={handleGenerate} isLoading={isLoading} used={usage?.used || 0} limit={null} />
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="glass" style={{ borderRadius: 20, padding: '52px 28px', textAlign: 'center' }}>
                <LoadingSpinner />
                <p style={{ marginTop: 18, color: 'rgba(201,169,110,0.6)', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Crafting your itinerary…</p>
              </div>
            )}

            {/* Trip result */}
            {currentTrip && !isLoading && (
              <div id="trip-result" className="animate-fadeUp">
                <SectionHeading icon={MapPin} label="Your Itinerary" color="#7EC8A0" />
                <TripDetail trip={currentTrip} plan={currentPlan} onExport={handleExport} onSave={handleSave} />
              </div>
            )}

            {/* Recent trips */}
            {trips.length > 0 && !isLoading && (
              <div>
                <SectionHeading icon={TrendingUp} label="Recent Trips" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {trips.slice(0, 5).map(trip => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onExport={handleExport} onView={() => viewTrip(trip)} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty */}
            {trips.length === 0 && !isLoading && !currentTrip && (
              <div className="glass dash-empty">
                <MapPin size={36} style={{ margin: '0 auto 14px', opacity: 0.15, color: '#C9A96E', display: 'block' }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300, color: '#E8E2D9', marginBottom: 6 }}>No journeys yet</p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(180,168,148,0.5)' }}>Fill the form above to generate your first AI-crafted itinerary</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="dash-right">

            {/* Usage */}
            {usage && <UsageCard used={usage.used} />}

            {/* Saved trips */}
            {trips.filter(t => t.saved).length > 0 && (
              <div className="glass-warm" style={{ borderRadius: 16, padding: '20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <BookmarkCheck size={14} color="#7EC8A0" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7EC8A0' }}>Saved Trips</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {trips.filter(t => t.saved).slice(0, 3).map(trip => (
                    <button key={trip.id} onClick={() => viewTrip(trip)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 9, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', fontSize: '0.875rem', color: 'rgba(220,210,190,0.8)', textTransform: 'capitalize', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.15)'; e.currentTarget.style.color = '#E8E2D9'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'rgba(220,210,190,0.8)'; }}
                    >
                      <MapPin size={12} color="#C9A96E" style={{ flexShrink: 0 }} />{trip.destination}
                    </button>
                  ))}
                </div>
                <div className="divider-gold" />
                <a href="/trips" style={{ display: 'block', textAlign: 'center', fontSize: '0.72rem', color: 'rgba(201,169,110,0.7)', letterSpacing: '0.06em', textDecoration: 'none', padding: '6px 0', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View all saved trips →</a>
              </div>
            )}

            {/* Tips */}
            <div className="glass-warm" style={{ borderRadius: 16, padding: '20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Lightbulb size={14} color="#C9A96E" />
                <span style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A96E' }}>Travel Tips</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Enter your city in Starting From', 'Longer trips get more detail', 'Set exact traveller count', 'Export to HTML, print as PDF'].map((tip, i) => (
                  <Tip key={i} index={i}>{tip}</Tip>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
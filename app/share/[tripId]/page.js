import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Clock, Users, DollarSign } from 'lucide-react';

// This page is fully public — no auth needed.
// Trip is looked up by shareToken (random hex), NOT by raw database ID.
export default async function SharePage({ params }) {
  const trip = await db.trip.findUnique({
    where: { shareToken: params.tripId }, // params.tripId is actually the token here
  });

  if (!trip || !trip.shareToken) return notFound();

  const itinerary = JSON.parse(trip.itinerary || '[]');
  const budget    = JSON.parse(trip.budget_breakdown || '{}');
  const hotels    = JSON.parse(trip.hotels || '[]');
  const attractions = JSON.parse(trip.attractions || '[]');
  const tips      = JSON.parse(trip.tips || '[]');

  const gold        = '#C9A96E';
  const goldDim     = 'rgba(201,169,110,0.55)';
  const goldBorder  = 'rgba(201,169,110,0.2)';
  const bg          = '#0A0805';
  const surface     = 'rgba(20,16,10,0.85)';
  const textPrimary = '#E8E2D9';
  const textMuted   = 'rgba(180,168,148,0.65)';
  const displayFont = '"Cormorant Garamond", Georgia, serif';
  const bodyFont    = '"DM Sans", system-ui, sans-serif';

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: bodyFont, color: textPrimary }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(201,169,110,0.08) 0%, rgba(10,8,5,0) 100%)',
        borderBottom: `1px solid ${goldBorder}`,
        padding: '48px 24px 36px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 18px',
          background: 'rgba(201,169,110,0.08)',
          border: `1px solid ${goldBorder}`,
          borderRadius: 20,
          fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: gold, marginBottom: 20,
        }}>
          ✦ Shared Trip by Voyager AI
        </div>

        <h1 style={{
          fontFamily: displayFont, fontWeight: 300,
          fontSize: 'clamp(2.2rem, 6vw, 3.6rem)',
          color: '#F0EAE0', letterSpacing: '0.04em',
          textTransform: 'capitalize', marginBottom: 16,
        }}>
          {trip.destination}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {[
            { label: `${trip.duration} days` },
            { label: `$${trip.budget} / ₹${(trip.budget * 83).toLocaleString('en-IN')}` },
            { label: `${trip.travellers} traveller${trip.travellers > 1 ? 's' : ''}` },
            { label: trip.tripType, accent: true },
          ].map((chip, i) => (
            <span key={i} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem',
              background: chip.accent ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.05)',
              border: chip.accent ? `1px solid rgba(201,169,110,0.3)` : '1px solid rgba(255,255,255,0.1)',
              color: chip.accent ? gold : 'rgba(220,210,190,0.8)',
              textTransform: 'capitalize',
            }}>{chip.label}</span>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Budget */}
        {Object.keys(budget).length > 0 && (
          <Section title="Budget Breakdown" icon="💰">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 10 }}>
              {Object.entries(budget).map(([key, val]) => (
                <div key={key} style={{ background: surface, border: `1px solid ${goldBorder}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: textMuted, textTransform: 'capitalize', marginBottom: 5 }}>{key}</div>
                  <div style={{ fontFamily: displayFont, fontSize: '1.3rem', color: '#4ADE80', fontWeight: 300 }}>${val}</div>
                  <div style={{ fontSize: '0.62rem', color: textMuted, marginTop: 3 }}>₹{(val * 83).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            <div style={{ background: surface, border: `1px solid ${goldBorder}`, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: textMuted }}>Total</span>
              <div>
                <span style={{ fontFamily: displayFont, fontSize: '1.2rem', color: textPrimary }}>${trip.budget}</span>
                <span style={{ fontSize: '0.75rem', color: textMuted, marginLeft: 8 }}>/ ₹{(trip.budget * 83).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Section>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <Section title="Day-by-Day Itinerary" icon="📋">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {itinerary.map((day, i) => (
                <div key={i} style={{ background: surface, border: `1px solid ${goldBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Day header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(201,169,110,0.05)', borderBottom: `1px solid ${goldBorder}` }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: `1px solid ${goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: displayFont, fontSize: '0.85rem', color: gold, flexShrink: 0 }}>{day.day}</span>
                    <div>
                      <div style={{ fontWeight: 500, color: textPrimary, fontSize: '0.9rem' }}>{day.title}</div>
                      {day.theme && <div style={{ fontSize: '0.7rem', color: goldDim, marginTop: 2 }}>{day.theme}</div>}
                    </div>
                    {day.dailyTotal && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#4ADE80' }}>{day.dailyTotal}</span>}
                  </div>

                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Highlight */}
                    {day.dayHighlight && (
                      <div style={{ padding: '8px 12px', background: 'rgba(201,169,110,0.07)', border: `1px solid rgba(201,169,110,0.18)`, borderRadius: 8, fontSize: '0.82rem', color: '#E8E2D9' }}>
                        ⭐ {day.dayHighlight}
                      </div>
                    )}

                    {/* Activities */}
                    {Array.isArray(day.activities) && day.activities.map((act, j) => {
                      const isObj = typeof act === 'object' && act !== null;
                      return (
                        <div key={j} style={{ display: 'flex', gap: 10, background: 'rgba(15,12,8,0.6)', borderRadius: 9, padding: '9px 12px', border: `1px solid rgba(201,169,110,0.07)` }}>
                          {isObj && act.time && (
                            <span style={{ fontSize: '0.68rem', color: '#60A5FA', background: 'rgba(96,165,250,0.1)', padding: '2px 7px', borderRadius: 5, fontWeight: 500, flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>{act.time}</span>
                          )}
                          <div style={{ flex: 1 }}>
                            {isObj ? (
                              <>
                                <div style={{ fontWeight: 500, color: textPrimary, fontSize: '0.85rem' }}>{act.place}</div>
                                {act.description && <div style={{ fontSize: '0.75rem', color: textMuted, marginTop: 4, lineHeight: 1.5 }}>{act.description}</div>}
                                <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                                  {act.duration && <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20, background: 'rgba(201,169,110,0.08)', color: goldDim }}>{act.duration}</span>}
                                  {act.cost && <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20, background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>{act.cost}</span>}
                                </div>
                                {act.tips && <div style={{ fontSize: '0.7rem', color: '#F6A84B', marginTop: 5, fontStyle: 'italic' }}>Tip: {act.tips}</div>}
                              </>
                            ) : (
                              <div style={{ fontSize: '0.82rem', color: textMuted }}>{act}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Meals */}
                    {(day.breakfast || day.lunch || day.dinner) && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginTop: 4 }}>
                        {[
                          { label: 'Breakfast', data: day.breakfast, color: '#FCD34D', bg: 'rgba(252,211,77,0.07)', border: 'rgba(252,211,77,0.18)' },
                          { label: 'Lunch',     data: day.lunch,      color: '#F6A84B', bg: 'rgba(246,168,75,0.07)',  border: 'rgba(246,168,75,0.18)'  },
                          { label: 'Dinner',    data: day.dinner,     color: '#F08080', bg: 'rgba(240,128,128,0.07)', border: 'rgba(240,128,128,0.18)' },
                        ].map(({ label, data, color, bg: mbg, border: mb }) => data ? (
                          <div key={label} style={{ background: mbg, border: `1px solid ${mb}`, borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: '0.6rem', color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: '0.78rem', color: textPrimary, fontWeight: 500 }}>{data.place}</div>
                            <div style={{ fontSize: '0.7rem', color: textMuted, marginTop: 2 }}>{data.dish}</div>
                            <div style={{ fontSize: '0.7rem', color: '#4ADE80', marginTop: 3 }}>{data.cost}</div>
                          </div>
                        ) : <div key={label} />)}
                      </div>
                    )}

                    {/* Accommodation + Transport */}
                    {(day.accommodation || day.transport) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                        {day.accommodation && (
                          <div style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: '0.6rem', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Stay</div>
                            <div style={{ fontSize: '0.75rem', color: textMuted }}>{day.accommodation}</div>
                          </div>
                        )}
                        {day.transport && (
                          <div style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: '0.6rem', color: '#22D3EE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Transport</div>
                            <div style={{ fontSize: '0.75rem', color: textMuted }}>{day.transport}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <Section title="Recommended Hotels" icon="🏨">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10 }}>
              {hotels.map((hotel, i) => (
                <div key={i} style={{ background: surface, border: `1px solid ${goldBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 500, color: textPrimary, fontSize: '0.875rem' }}>{hotel.name}</div>
                    <span style={{ fontSize: '0.7rem', color: '#FCD34D', flexShrink: 0, marginLeft: 8 }}>⭐ {hotel.rating}</span>
                  </div>
                  {hotel.area && <div style={{ fontSize: '0.7rem', color: textMuted, marginBottom: 6 }}>{hotel.area}</div>}
                  <div style={{ fontSize: '0.88rem', fontFamily: displayFont, color: '#4ADE80' }}>
                    ${hotel.price}/night
                    {hotel.priceINR && <span style={{ fontSize: '0.7rem', color: textMuted, marginLeft: 6 }}>₹{hotel.priceINR?.toLocaleString('en-IN')}</span>}
                  </div>
                  {hotel.description && <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: 5, lineHeight: 1.5 }}>{hotel.description}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Attractions */}
        {attractions.length > 0 && (
          <Section title="Top Attractions" icon="📍">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10 }}>
              {attractions.map((att, i) => (
                <div key={i} style={{ background: surface, border: `1px solid ${goldBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 500, color: textPrimary, fontSize: '0.875rem', marginBottom: 7 }}>{att.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {att.distance  && <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(201,169,110,0.06)', border: `1px solid ${goldBorder}`, fontSize: '0.63rem', color: textMuted }}>{att.distance}</span>}
                    {att.entry_fee && <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', fontSize: '0.63rem', color: '#4ADE80' }}>{att.entry_fee}</span>}
                    {att.best_time && <span style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', fontSize: '0.63rem', color: '#60A5FA' }}>{att.best_time}</span>}
                  </div>
                  {att.tips && <div style={{ fontSize: '0.7rem', color: textMuted, marginTop: 6, fontStyle: 'italic' }}>{att.tips}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <Section title="Travel Tips" icon="💡">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, background: surface, borderRadius: 9, padding: '10px 14px', border: `1px solid ${goldBorder}` }}>
                  <span style={{ color: '#FCD34D', fontWeight: 600, flexShrink: 0, fontSize: '0.8rem' }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.83rem', color: textMuted, lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* CTA */}
        <div style={{
          textAlign: 'center', padding: '32px 24px',
          background: 'rgba(201,169,110,0.06)',
          border: `1px solid ${goldBorder}`,
          borderRadius: 18, marginTop: 8,
        }}>
          <div style={{ fontFamily: displayFont, fontWeight: 300, fontSize: '1.6rem', color: textPrimary, marginBottom: 8 }}>
            Plan your own journey
          </div>
          <div style={{ fontSize: '0.85rem', color: textMuted, marginBottom: 20 }}>
            Get personalised AI itineraries, budget plans, hotel picks and more
          </div>
          <a href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'rgba(201,169,110,0.9)',
              color: '#0A0805',
              fontWeight: 600, fontSize: '0.88rem',
              borderRadius: 10, textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            Try Voyager AI Free ✦
          </a>
        </div>

      </div>
    </div>
  );
}

// ── Small reusable section wrapper ──────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{
      background: 'rgba(15,12,8,0.6)',
      border: 'rgba(201,169,110,0.15) 1px solid',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(201,169,110,0.12)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(201,169,110,0.04)',
      }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <h2 style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 300, fontSize: '1.1rem',
          color: '#E8E2D9', letterSpacing: '0.04em', margin: 0,
        }}>{title}</h2>
      </div>
      <div style={{ padding: '16px 16px' }}>
        {children}
      </div>
    </div>
  );
}
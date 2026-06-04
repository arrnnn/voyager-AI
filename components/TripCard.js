'use client';

import { MapPin, Clock, DollarSign, Users, Eye, Download, Trash2 } from 'lucide-react';

export default function TripCard({ trip, onDelete, onExport, onView }) {
  const date = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const tripTypeColor = {
    normal:    { bg: 'rgba(201,169,110,0.1)',  border: 'rgba(201,169,110,0.22)', text: '#C9A96E' },
    family:    { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)',   text: '#4ADE80' },
    couples:   { bg: 'rgba(240,100,148,0.1)',  border: 'rgba(240,100,148,0.2)',  text: '#F06494' },
    bachelors: { bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.2)',  text: '#A78BFA' },
    solo:      { bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.2)',   text: '#38BDF8' },
    business:  { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',  text: '#94A3B8' },
  };
  const typeStyle = tripTypeColor[trip.tripType] || tripTypeColor.normal;

  return (
    <div
      style={{
        background: 'rgba(15, 12, 8, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(201,169,110,0.12)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.28)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: 'rgba(201,169,110,0.1)',
        border: '1px solid rgba(201,169,110,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MapPin size={18} color="#C9A96E" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontWeight: 400, fontSize: '1.05rem',
            color: '#E8E2D9', textTransform: 'capitalize',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {trip.destination}
          </span>
          <span style={{
            fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'capitalize',
            padding: '2px 8px', borderRadius: 20,
            background: typeStyle.bg, border: `1px solid ${typeStyle.border}`,
            color: typeStyle.text, flexShrink: 0,
          }}>
            {trip.tripType || 'Normal'}
          </span>
          {trip.saved && (
            <span style={{
              fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 20,
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              color: '#4ADE80', flexShrink: 0,
            }}>
              Saved
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {date && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(180,168,148,0.5)', letterSpacing: '0.02em' }}>
              {date}
            </span>
          )}
          {trip.budget && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(180,168,148,0.65)' }}>
              <DollarSign size={10} color="rgba(201,169,110,0.6)" />${trip.budget}
            </span>
          )}
          {trip.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(180,168,148,0.65)' }}>
              <Clock size={10} color="rgba(201,169,110,0.6)" />{trip.duration}d
            </span>
          )}
          {trip.travellers && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(180,168,148,0.65)' }}>
              <Users size={10} color="rgba(201,169,110,0.6)" />{trip.travellers} pax
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <ActionBtn onClick={onView} title="View" color="rgba(201,169,110,0.7)">
          <Eye size={14} />
          <span style={{ fontSize: '0.75rem' }}>View</span>
        </ActionBtn>
        <IconBtn onClick={() => onExport(trip.id)} title="Export" hoverColor="rgba(201,169,110,0.8)">
          <Download size={13} />
        </IconBtn>
        <IconBtn onClick={() => onDelete(trip.id)} title="Delete" hoverColor="#F08080" danger>
          <Trash2 size={13} />
        </IconBtn>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 12px',
        background: 'rgba(201,169,110,0.08)',
        border: '1px solid rgba(201,169,110,0.2)',
        borderRadius: 8, cursor: 'pointer',
        color: color || '#E8E2D9',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(201,169,110,0.15)';
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(201,169,110,0.08)';
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)';
      }}
    >
      {children}
    </button>
  );
}

function IconBtn({ onClick, children, title, hoverColor, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: danger ? 'rgba(180,40,40,0.08)' : 'rgba(201,169,110,0.06)',
        border: `1px solid ${danger ? 'rgba(200,60,60,0.18)' : 'rgba(201,169,110,0.15)'}`,
        borderRadius: 8, cursor: 'pointer',
        color: danger ? 'rgba(240,128,128,0.6)' : 'rgba(180,168,148,0.55)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = hoverColor || '#E8E2D9';
        e.currentTarget.style.background = danger ? 'rgba(180,40,40,0.15)' : 'rgba(201,169,110,0.12)';
        e.currentTarget.style.borderColor = danger ? 'rgba(200,60,60,0.3)' : 'rgba(201,169,110,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = danger ? 'rgba(240,128,128,0.6)' : 'rgba(180,168,148,0.55)';
        e.currentTarget.style.background = danger ? 'rgba(180,40,40,0.08)' : 'rgba(201,169,110,0.06)';
        e.currentTarget.style.borderColor = danger ? 'rgba(200,60,60,0.18)' : 'rgba(201,169,110,0.15)';
      }}
    >
      {children}
    </button>
  );
}
'use client';

import { useState } from 'react';
import { Loader2, MapPin, DollarSign, Calendar, Users, Compass } from 'lucide-react';

const inputStyle = {
  width: '100%',
  background: 'rgba(12, 10, 6, 0.65)',
  border: '1px solid rgba(201, 169, 110, 0.15)',
  color: '#E8E2D9',
  borderRadius: 9,
  padding: '11px 14px',
  fontSize: '0.875rem',
  fontFamily: 'DM Sans, system-ui, sans-serif',
  outline: 'none',
  transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(201, 169, 110, 0.65)',
  marginBottom: 7,
};

function Field({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label style={labelStyle}>
        {Icon && <Icon size={10} />}
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: '0.72rem', color: 'rgba(180,168,148,0.45)', marginTop: 5 }}>{hint}</p>
      )}
    </div>
  );
}

export default function TravelForm({ onSubmit, isLoading, used, limit }) {
  const [formData, setFormData] = useState({
    destination: '',
    origin: '',
    budget: '',
    duration: '',
    travellers: '2',
    tripType: 'normal',
  });
  const [focused, setFocused] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.destination || !formData.budget || !formData.duration) {
      alert('Please fill in destination, budget, and duration');
      return;
    }
    onSubmit(formData);
  };

  const remaining = limit ? limit - used : null;
  const atLimit = remaining === 0;
  const budgetINR = formData.budget ? Math.round(formData.budget * 83).toLocaleString('en-IN') : null;

  const getFocusStyle = (name) => ({
    ...inputStyle,
    borderColor: focused === name ? 'rgba(201,169,110,0.5)' : 'rgba(201,169,110,0.15)',
    boxShadow: focused === name ? '0 0 0 3px rgba(201,169,110,0.06), 0 4px 16px rgba(0,0,0,0.25)' : 'none',
    background: focused === name ? 'rgba(18,15,9,0.8)' : 'rgba(12,10,6,0.65)',
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Destination *" icon={MapPin}>
          <input
            type="text" name="destination"
            value={formData.destination} onChange={handleChange}
            placeholder="Paris, Bali, Tokyo…"
            disabled={isLoading}
            style={getFocusStyle('destination')}
            onFocus={() => setFocused('destination')}
            onBlur={() => setFocused('')}
          />
        </Field>
        <Field label="Starting From" icon={Compass}>
          <input
            type="text" name="origin"
            value={formData.origin} onChange={handleChange}
            placeholder="Mumbai, Delhi, Chennai…"
            disabled={isLoading}
            style={getFocusStyle('origin')}
            onFocus={() => setFocused('origin')}
            onBlur={() => setFocused('')}
          />
        </Field>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field
          label="Budget (USD) *"
          icon={DollarSign}
          hint={budgetINR ? `≈ ₹${budgetINR} INR` : null}
        >
          <input
            type="number" name="budget"
            value={formData.budget} onChange={handleChange}
            placeholder="3000"
            disabled={isLoading}
            style={getFocusStyle('budget')}
            onFocus={() => setFocused('budget')}
            onBlur={() => setFocused('')}
          />
        </Field>
        <Field label="Duration (days) *" icon={Calendar}>
          <input
            type="number" name="duration"
            value={formData.duration} onChange={handleChange}
            placeholder="7"
            disabled={isLoading}
            style={getFocusStyle('duration')}
            onFocus={() => setFocused('duration')}
            onBlur={() => setFocused('')}
          />
        </Field>
      </div>

      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <Field label="Travellers" icon={Users}>
          <input
            type="number" name="travellers" min="1"
            value={formData.travellers} onChange={handleChange}
            disabled={isLoading}
            style={getFocusStyle('travellers')}
            onFocus={() => setFocused('travellers')}
            onBlur={() => setFocused('')}
          />
        </Field>
        <Field label="Trip Type">
          <select
            name="tripType"
            value={formData.tripType}
            onChange={handleChange}
            disabled={isLoading}
            style={{
              ...getFocusStyle('tripType'),
              appearance: 'none',
              cursor: 'pointer',
            }}
            onFocus={() => setFocused('tripType')}
            onBlur={() => setFocused('')}
          >
            <option value="normal">🌍 Normal</option>
            <option value="family">👨‍👩‍👧 Family</option>
            <option value="couples">💑 Couples</option>
            <option value="bachelors">🎉 Bachelors</option>
            <option value="solo">🎒 Solo</option>
            <option value="business">💼 Business</option>
          </select>
        </Field>
      </div>

      {/* Limit warning */}
      {remaining !== null && (
        <div style={{
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 10,
          background: atLimit ? 'rgba(180,40,40,0.1)' : 'rgba(20,16,10,0.5)',
          border: `1px solid ${atLimit ? 'rgba(200,60,60,0.25)' : 'rgba(201,169,110,0.12)'}`,
          fontSize: '0.82rem',
          color: atLimit ? '#F0A0A0' : 'rgba(180,168,148,0.6)',
        }}>
          {atLimit
            ? 'Daily limit reached. Upgrade to Pro for unlimited generations.'
            : `${remaining} generations remaining today`}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || atLimit}
        style={{
          width: '100%',
          padding: '14px',
          background: isLoading || atLimit
            ? 'rgba(60,50,35,0.4)'
            : 'linear-gradient(135deg, #C9A96E 0%, #A8844A 50%, #C9A96E 100%)',
          backgroundSize: '200%',
          color: isLoading || atLimit ? 'rgba(180,168,148,0.4)' : '#0D0B07',
          border: 'none',
          borderRadius: 10,
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '0.82rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: isLoading || atLimit ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          if (!isLoading && !atLimit) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,169,110,0.3)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isLoading
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Crafting your itinerary…</>
          : '✦ Generate Trip Plan'
        }
      </button>
    </form>
  );
}
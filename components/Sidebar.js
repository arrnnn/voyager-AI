'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Zap, LogOut, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isPro, setIsPro] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsPro(sessionStorage.getItem('userPlan') === 'pro');
  }, []);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!isSignedIn) return null;

  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/trips',     label: 'Saved Trips', icon: MapPin },
  ];

  const SidebarContent = () => (
    <div style={{
      width: 256,
      background: 'rgba(8,6,3,0.97)',
      backdropFilter: 'blur(24px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(201,169,110,0.12)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 22px', borderBottom: '1px solid rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#C9A96E,#8B6F47)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: '#0D0B07', flexShrink: 0 }}>V</div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: '1.1rem', color: '#E8E2D9', letterSpacing: '0.04em', lineHeight: 1.2 }}>Voyager AI</div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.5)', marginTop: 2 }}>Travel Planner</div>
          </div>
        </div>
        {/* Mobile close button */}
        <button onClick={() => setOpen(false)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(201,169,110,0.6)', padding: 4 }} className="sb-close-btn">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', borderRadius: 10,
              border: `1px solid ${active ? 'rgba(201,169,110,0.25)' : 'transparent'}`,
              background: active ? 'rgba(201,169,110,0.12)' : 'transparent',
              color: active ? '#E8D5B0' : 'rgba(200,190,170,0.6)',
              fontSize: '0.875rem', fontWeight: 400,
              letterSpacing: '0.02em', textDecoration: 'none',
              transition: 'all 0.25s ease',
              minHeight: 44, // touch target
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#E8E2D9'; e.currentTarget.style.background = 'rgba(201,169,110,0.07)'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(200,190,170,0.6)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <Icon size={16} style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Pro card */}
      <div style={{ margin: '0 12px 14px' }}>
        {isPro ? (
          <div style={{ padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(201,169,110,0.12),rgba(139,111,71,0.08))', border: '1px solid rgba(201,169,110,0.25)', textAlign: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A96E,#8B6F47)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <Zap size={14} color="#0D0B07" fill="#0D0B07" />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '0.95rem', fontWeight: 300, color: '#E8E2D9', marginBottom: 3 }}>Voyager AI</div>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A96E' }}>Pro Member</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ fontSize: '0.68rem', color: '#4ADE80' }}>Active</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(201,169,110,0.1),rgba(139,111,71,0.06))', border: '1px solid rgba(201,169,110,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={14} color="rgba(201,169,110,0.8)" />
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: '0.95rem', color: '#E8D5B0' }}>Upgrade to Pro</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(180,168,148,0.6)', marginBottom: 12 }}>Unlimited AI generations</p>
            <Link href="/pricing" style={{ display: 'block', textAlign: 'center', padding: '9px', background: 'linear-gradient(135deg,#C9A96E,#A8844A)', color: '#0D0B07', borderRadius: 8, fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✦ See Plans
            </Link>
          </div>
        )}
      </div>

      {/* User */}
      <div style={{ padding: '14px 16px 20px', borderTop: '1px solid rgba(201,169,110,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.25)', flexShrink: 0 }} />
            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: '0.9rem', color: '#C9A96E', flexShrink: 0 }}>{(user?.fullName || 'U')[0]}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#E8E2D9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName || 'User'}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(180,168,148,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
        <button onClick={() => { sessionStorage.clear(); signOut(); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(201,169,110,0.1)', color: 'rgba(180,168,148,0.5)', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.2s', minHeight: 40 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E2D9'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)'; e.currentTarget.style.background = 'rgba(201,169,110,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(180,168,148,0.5)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.1)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* ── Desktop sidebar ── */
        .sb-desktop {
          width: 256px; height: 100vh;
          position: fixed; left: 0; top: 0; z-index: 40;
        }
        /* ── Mobile hamburger button ── */
        .sb-hamburger {
          display: none;
          position: fixed; top: 16px; left: 16px; z-index: 200;
          width: 44px; height: 44px;
          background: rgba(10,8,5,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 10px;
          align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(201,169,110,0.8);
        }
        /* ── Mobile overlay + drawer ── */
        .sb-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 150;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }
        .sb-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 160;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
          width: 280px;
        }
        .sb-drawer.open { transform: translateX(0); }
        .sb-close-btn { display: none !important; }

        @media (max-width: 768px) {
          .sb-desktop { display: none; }
          .sb-hamburger { display: flex; }
          .sb-overlay { display: block; }
          .sb-close-btn { display: flex !important; }
        }
      `}</style>

      {/* Desktop — always visible */}
      <div className="sb-desktop">
        <SidebarContent />
      </div>

      {/* Mobile — hamburger button */}
      <button className="sb-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Mobile — overlay + drawer */}
      {open && (
        <div className="sb-overlay" onClick={() => setOpen(false)}>
          <div className="sb-drawer open" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
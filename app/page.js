import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export default async function HomePage() {
  let isLoggedIn = false;
  try {
    const { userId } = auth();
    if (userId) isLoggedIn = true;
  } catch (e) {}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');

        .vl-root{min-height:100vh;background:#06050A;color:#E8E2D9;font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden;position:relative}
        .vl-bg{position:fixed;inset:0;z-index:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,169,110,0.07) 0%,transparent 65%),url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80&auto=format&fit=crop') center/cover no-repeat}
        .vl-bg-overlay{position:fixed;inset:0;z-index:1;background:linear-gradient(180deg,rgba(6,5,10,0.72) 0%,rgba(6,5,10,0.55) 30%,rgba(6,5,10,0.78) 70%,rgba(6,5,10,0.96) 100%)}
        .vl-content{position:relative;z-index:2}

        /* Navbar */
        .vl-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:linear-gradient(180deg,rgba(6,5,10,0.9) 0%,transparent 100%)}
        .vl-nav-logo{font-family:'Cormorant Garamond',serif;font-weight:900;font-size:1.1rem;letter-spacing:0.12em;color:rgba(201,169,110,0.9);text-decoration:none;text-transform:uppercase}
        .vl-nav-links{display:flex;align-items:center;gap:28px}
        .vl-nav-link{font-family:'DM Mono',monospace;font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;color:rgba(232,226,217,0.5);text-decoration:none;transition:color 0.25s}
        .vl-nav-link:hover{color:rgba(201,169,110,0.9)}
        .vl-nav-cta{font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#06050A;background:rgba(201,169,110,0.9);padding:9px 22px;text-decoration:none;transition:all 0.25s}
        .vl-nav-cta:hover{background:rgba(201,169,110,1)}

        /* Hero */
        .vl-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 60px;position:relative}
        .vl-issue{display:flex;align-items:center;gap:14px;margin-bottom:32px;width:100%;max-width:860px}
        .vl-issue-text{font-family:'DM Mono',monospace;font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,169,110,0.55);white-space:nowrap}
        .vl-issue-rule{flex:1;height:1px;background:rgba(201,169,110,0.12)}
        .vl-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border:1px solid rgba(201,169,110,0.18);background:rgba(201,169,110,0.05);margin-bottom:36px}
        .vl-badge-dot{width:6px;height:6px;border-radius:50%;background:#4ADE80;box-shadow:0 0 6px rgba(74,222,128,0.7);animation:vl-pulse 2s ease-in-out infinite}
        .vl-badge-text{font-family:'DM Mono',monospace;font-size:0.6rem;letter-spacing:0.16em;text-transform:uppercase;color:rgba(232,226,217,0.55)}
        @keyframes vl-pulse{0%,100%{box-shadow:0 0 6px rgba(74,222,128,0.7)}50%{box-shadow:0 0 12px rgba(74,222,128,1)}}

        /* Wordmark */
        .vl-wordmark-wrap{position:relative;cursor:default;margin-bottom:28px;user-select:none}
        .vl-wordmark{font-family:'Cormorant Garamond',Georgia,serif;font-weight:900;font-size:clamp(3.8rem,12vw,12rem);letter-spacing:-0.03em;line-height:0.88;background-image:url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85&auto=format&fit=crop');background-size:cover;background-position:center 30%;-webkit-background-clip:text;background-clip:text;color:transparent;transition:transform 0.6s cubic-bezier(0.22,1,0.36,1),filter 0.4s ease;display:block;filter:brightness(1.1) contrast(1.05)}
        .vl-wordmark-wrap:hover .vl-wordmark{transform:translateY(-8px) scale(1.015);filter:brightness(1.3) contrast(1.1)}
        .vl-wordmark-ghost{font-family:'Cormorant Garamond',Georgia,serif;font-weight:900;font-size:clamp(3.8rem,12vw,12rem);letter-spacing:-0.03em;line-height:0.88;color:transparent;-webkit-text-stroke:1px rgba(201,169,110,0.06);position:absolute;inset:0;pointer-events:none;transition:opacity 0.4s}
        .vl-wordmark-wrap:hover .vl-wordmark-ghost{opacity:0}
        .vl-wordmark-glow{position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);width:60%;height:36px;background:radial-gradient(ellipse,rgba(201,169,110,0.2) 0%,transparent 70%);opacity:0;transition:opacity 0.5s ease;pointer-events:none;filter:blur(8px)}
        .vl-wordmark-wrap:hover .vl-wordmark-glow{opacity:1}

        .vl-subline{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:clamp(1rem,2.5vw,1.5rem);letter-spacing:0.06em;color:rgba(232,226,217,0.5);margin-bottom:44px;line-height:1.4}
        .vl-subline em{color:rgba(201,169,110,0.75);font-style:normal}

        /* CTAs */
        .vl-cta-row{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:60px}
        .vl-btn-primary{display:inline-flex;align-items:center;gap:9px;padding:14px 36px;background:rgba(201,169,110,0.92);color:#06050A;font-family:'DM Sans',sans-serif;font-weight:600;font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;transition:all 0.3s cubic-bezier(0.22,1,0.36,1);border:1px solid transparent;min-height:48px}
        .vl-btn-primary:hover{background:rgba(201,169,110,1);transform:translateY(-2px);box-shadow:0 12px 40px rgba(201,169,110,0.25)}
        .vl-btn-secondary{display:inline-flex;align-items:center;gap:9px;padding:14px 32px;background:transparent;color:rgba(232,226,217,0.65);font-family:'DM Sans',sans-serif;font-weight:400;font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(232,226,217,0.15);transition:all 0.3s;min-height:48px}
        .vl-btn-secondary:hover{color:rgba(232,226,217,0.9);border-color:rgba(232,226,217,0.35);transform:translateY(-2px)}

        /* Stats */
        .vl-stats{display:flex;align-items:center;border:1px solid rgba(201,169,110,0.12);background:rgba(10,8,5,0.55);backdrop-filter:blur(16px);width:100%;max-width:480px}
        .vl-stat{padding:18px 28px;text-align:center;border-right:1px solid rgba(201,169,110,0.1);flex:1}
        .vl-stat:last-child{border-right:none}
        .vl-stat-num{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:1.9rem;color:rgba(201,169,110,0.9);line-height:1;margin-bottom:4px}
        .vl-stat-label{font-family:'DM Mono',monospace;font-size:0.52rem;letter-spacing:0.16em;text-transform:uppercase;color:rgba(232,226,217,0.35)}

        /* Scroll hint */
        .vl-scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.35}
        .vl-scroll-line{width:1px;height:36px;background:linear-gradient(180deg,rgba(201,169,110,0.8),transparent);animation:vl-scroll-drop 2s ease-in-out infinite}
        @keyframes vl-scroll-drop{0%,100%{transform:scaleY(1);transform-origin:top;opacity:0.6}50%{transform:scaleY(0.5);opacity:0.3}}
        .vl-scroll-label{font-family:'DM Mono',monospace;font-size:0.48rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,169,110,0.6)}

        /* Features */
        .vl-features{padding:100px 48px;max-width:1200px;margin:0 auto}
        .vl-feat-header{display:flex;align-items:center;gap:20px;margin-bottom:56px}
        .vl-feat-title{font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:clamp(1.8rem,4vw,2.8rem);color:rgba(232,226,217,0.85);letter-spacing:0.02em;white-space:nowrap}
        .vl-feat-rule{flex:1;height:1px;background:rgba(201,169,110,0.1)}
        .vl-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.08)}
        .vl-feat-cell{padding:28px 24px;background:rgba(8,6,4,0.85);backdrop-filter:blur(8px);transition:background 0.3s;cursor:default}
        .vl-feat-cell:hover{background:rgba(201,169,110,0.05)}
        .vl-feat-num{font-family:'DM Mono',monospace;font-size:0.52rem;letter-spacing:0.14em;color:rgba(201,169,110,0.35);margin-bottom:14px}
        .vl-feat-name{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:1.15rem;color:rgba(232,226,217,0.9);letter-spacing:0.02em;margin-bottom:8px;line-height:1.15}
        .vl-feat-desc{font-family:'DM Sans',sans-serif;font-size:0.78rem;line-height:1.65;color:rgba(180,148,148,0.6)}

        /* Bottom CTA */
        .vl-bottom{padding:100px 48px;text-align:center;border-top:1px solid rgba(201,169,110,0.08);position:relative}
        .vl-bottom-line{position:absolute;top:0;left:50%;transform:translateX(-50%);width:1px;height:72px;background:linear-gradient(180deg,transparent,rgba(201,169,110,0.3))}
        .vl-bottom-overline{font-family:'DM Mono',monospace;font-size:0.56rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,169,110,0.45);margin-bottom:18px}
        .vl-bottom-title{font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:clamp(2rem,5vw,3.8rem);color:rgba(232,226,217,0.85);letter-spacing:0.02em;line-height:1;margin-bottom:44px}

        /* Footer */
        .vl-footer{padding:24px 48px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(201,169,110,0.06)}
        .vl-footer-logo{font-family:'Cormorant Garamond',serif;font-weight:900;font-size:0.85rem;letter-spacing:0.18em;color:rgba(201,169,110,0.45);text-transform:uppercase}
        .vl-footer-copy{font-family:'DM Mono',monospace;font-size:0.52rem;letter-spacing:0.1em;color:rgba(232,226,217,0.18)}

        /* ── MOBILE OVERRIDES ── */
        @media (max-width: 768px) {
          .vl-nav { padding: 16px 20px; }
          .vl-nav-link { display: none; } /* hide nav links on mobile, keep CTA */
          .vl-hero { padding: 88px 20px 56px; }
          .vl-issue { margin-bottom: 24px; }
          .vl-badge { margin-bottom: 28px; }
          .vl-cta-row { flex-direction: column; gap: 10px; margin-bottom: 44px; }
          .vl-btn-primary, .vl-btn-secondary { width: 100%; max-width: 320px; justify-content: center; }
          .vl-stats { max-width: 100%; }
          .vl-stat { padding: 14px 16px; }
          .vl-stat-num { font-size: 1.6rem; }
          .vl-scroll-hint { display: none; }

          .vl-features { padding: 64px 20px; }
          .vl-feat-header { margin-bottom: 36px; }
          .vl-feat-title { white-space: normal; font-size: 1.7rem; }
          .vl-feat-grid { grid-template-columns: 1fr; } /* stack to single col */
          .vl-feat-cell { padding: 22px 20px; }

          .vl-bottom { padding: 64px 20px; }
          .vl-footer { padding: 20px; flex-direction: column; gap: 8px; text-align: center; }
        }

        @media (max-width: 480px) {
          .vl-nav-logo { font-size: 0.95rem; }
          .vl-feat-grid { grid-template-columns: 1fr; }
          .vl-stats { flex-direction: column; border: 1px solid rgba(201,169,110,0.12); }
          .vl-stat { border-right: none; border-bottom: 1px solid rgba(201,169,110,0.1); padding: 14px; }
          .vl-stat:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="vl-root">
        <div className="vl-bg" />
        <div className="vl-bg-overlay" />

        <div className="vl-content">

          {/* Navbar */}
          <nav className="vl-nav">
            <span className="vl-nav-logo">Voyager AI</span>
            <div className="vl-nav-links">
              <Link href="/pricing" className="vl-nav-link">Pricing</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="vl-nav-cta">Dashboard</Link>
              ) : (
                <>
                  <Link href="/sign-in" className="vl-nav-link">Sign In</Link>
                  <Link href="/sign-up" className="vl-nav-cta">Get Started</Link>
                </>
              )}
            </div>
          </nav>

          {/* Hero */}
          <section className="vl-hero">
            <div className="vl-issue">
              <span className="vl-issue-text">AI Travel Planner</span>
              <div className="vl-issue-rule" />
              <span className="vl-issue-text">2025</span>
            </div>

            <div className="vl-badge">
              <div className="vl-badge-dot" />
              <span className="vl-badge-text">Plans ready in seconds</span>
            </div>

            <div className="vl-wordmark-wrap">
              <span className="vl-wordmark">VOYAGER AI</span>
              <span className="vl-wordmark-ghost" aria-hidden="true">VOYAGER AI</span>
              <div className="vl-wordmark-glow" />
            </div>

            <p className="vl-subline">
              Your dream trip, <em>planned by AI</em> — in seconds
            </p>

            <div className="vl-cta-row">
              {isLoggedIn ? (
                <Link href="/dashboard" className="vl-btn-primary">
                  <LayoutDashboard size={15} />
                  Go to Dashboard
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="vl-btn-primary">
                    Start Planning Free
                    <ArrowRight size={14} />
                  </Link>
                  <Link href="/sign-in" className="vl-btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="vl-stats">
              {[
                { num: '10s', label: 'Plan generated' },
                { num: '50+', label: 'Destinations' },
                { num: 'Free', label: 'To start' },
              ].map((s, i) => (
                <div key={i} className="vl-stat">
                  <div className="vl-stat-num">{s.num}</div>
                  <div className="vl-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="vl-scroll-hint">
              <div className="vl-scroll-line" />
              <span className="vl-scroll-label">Scroll</span>
            </div>
          </section>

          {/* Features */}
          <section className="vl-features">
            <div className="vl-feat-header">
              <h2 className="vl-feat-title">Everything included</h2>
              <div className="vl-feat-rule" />
            </div>
            <div className="vl-feat-grid">
              {[
                { n: '01', title: 'Day-by-Day Itinerary', desc: 'Real place names, activities, meals, and insider tips — every single day.' },
                { n: '02', title: 'Budget in INR & USD', desc: 'Complete breakdown across flights, hotels, food and activities in both currencies.' },
                { n: '03', title: 'Hotels & Attractions', desc: 'Curated picks tailored to your travel style, budget, and destination.' },
                { n: '04', title: 'Visa & Travel Info', desc: 'Requirements, currency guide, emergency contacts, best time to visit.' },
                { n: '05', title: 'AI Trip Assistant', desc: 'Chat with an AI that knows your trip inside out. Ask anything, anytime.' },
                { n: '06', title: 'Save & Export', desc: 'Save trips, export as HTML, print as PDF, share with companions.' },
              ].map(f => (
                <div key={f.n} className="vl-feat-cell">
                  <div className="vl-feat-num">{f.n}</div>
                  <div className="vl-feat-name">{f.title}</div>
                  <p className="vl-feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="vl-bottom">
            <div className="vl-bottom-line" />
            <p className="vl-bottom-overline">Ready to explore?</p>
            <h2 className="vl-bottom-title">Plan your next journey</h2>
            <div className="vl-cta-row">
              {isLoggedIn ? (
                <Link href="/dashboard" className="vl-btn-primary">
                  <LayoutDashboard size={15} />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="vl-btn-primary">
                    Get Started Free <ArrowRight size={14} />
                  </Link>
                  <Link href="/sign-in" className="vl-btn-secondary">Sign In</Link>
                </>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="vl-footer">
            <span className="vl-footer-logo">Voyager AI</span>
            <span className="vl-footer-copy">© 2025 · AI Travel Planner</span>
          </footer>

        </div>
      </div>
    </>
  );
}
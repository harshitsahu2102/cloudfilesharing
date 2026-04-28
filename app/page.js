'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── HERO ─────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 100px' }}>
          {/* Background Orbs */}
          <div className="glow-orb" style={{
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
            top: '-100px', left: '-100px',
          }} />
          <div className="glow-orb" style={{
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)',
            top: '0', right: '-80px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 999,
              padding: '6px 18px',
              fontSize: 13,
              color: 'var(--primary-light)',
              fontWeight: 600,
              marginBottom: 32,
              animation: 'fadeInUp 0.5s ease forwards',
            }}>
              <span>✨</span> Secure · Fast · Free
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-2px',
              marginBottom: 24,
              animation: 'fadeInUp 0.55s ease forwards 0.05s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              Share Files{' '}
              <span className="gradient-text">Securely</span>
              <br />with the World
            </h1>

            <p style={{
              fontSize: 18,
              color: 'var(--text-muted)',
              maxWidth: 520,
              margin: '0 auto 48px',
              lineHeight: 1.7,
              animation: 'fadeInUp 0.6s ease forwards 0.1s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              Upload any file, create a secure share link with optional password protection and expiry — no account needed to download.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeInUp 0.65s ease forwards 0.15s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                🚀 Get Started Free
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                Sign In →
              </Link>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 48,
              marginTop: 72,
              flexWrap: 'wrap',
              animation: 'fadeInUp 0.7s ease forwards 0.2s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              {[
                { val: '50 MB', label: 'Max file size' },
                { val: '∞', label: 'Share links' },
                { val: '100%', label: 'Free forever' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {s.val}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────── */}
        <section style={{ padding: '80px 24px', position: 'relative' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
                Everything you need to
                <span className="gradient-text"> share safely</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
                Built on Firebase with enterprise-grade security for everyone.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
              {[
                {
                  icon: '🔒',
                  title: 'Password Protection',
                  desc: 'Add a password to any share link. Only people with the password can download your file.',
                  color: '#7c3aed',
                },
                {
                  icon: '⏱️',
                  title: 'Link Expiry',
                  desc: 'Set links to expire after 1 hour, 24 hours, or 7 days. Perfect for time-sensitive sends.',
                  color: '#06b6d4',
                },
                {
                  icon: '☁️',
                  title: 'Cloud Storage',
                  desc: 'Files stored securely in Firebase Storage. Access your uploads from anywhere.',
                  color: '#7c3aed',
                },
                {
                  icon: '⚡',
                  title: 'Instant Downloads',
                  desc: 'No waiting, no ads, no login required for recipients. Direct download in one click.',
                  color: '#06b6d4',
                },
                {
                  icon: '🔐',
                  title: 'Secure Auth',
                  desc: 'Sign in with Google or email. Your files are private — only you can manage them.',
                  color: '#7c3aed',
                },
                {
                  icon: '📊',
                  title: 'Storage Tracker',
                  desc: 'See your storage usage at a glance on your personal dashboard.',
                  color: '#06b6d4',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="card"
                  style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 14,
                    background: `rgba(${f.color === '#7c3aed' ? '124,58,237' : '6,182,212'}, 0.12)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                    border: `1px solid rgba(${f.color === '#7c3aed' ? '124,58,237' : '6,182,212'}, 0.2)`,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────── */}
        <section style={{ padding: '80px 24px' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 56 }}>
              Up and running in{' '}
              <span className="gradient-text">3 steps</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { step: '01', title: 'Create your account', desc: 'Sign up with Google or email in seconds.' },
                { step: '02', title: 'Upload your file', desc: 'Drag & drop any file up to 50 MB onto your dashboard.' },
                { step: '03', title: 'Share the link', desc: 'Set a password and expiry if needed, then share the link with anyone.' },
              ].map((item, i) => (
                <div key={item.step} style={{ display: 'flex', gap: 24, padding: '28px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 800,
                    color: 'var(--primary-light)',
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    borderRadius: 10,
                    padding: '6px 12px',
                    alignSelf: 'flex-start',
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────── */}
        <section style={{ padding: '80px 24px 100px' }}>
          <div className="container" style={{ maxWidth: 600 }}>
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '56px 40px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
                borderColor: 'rgba(124,58,237,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="glow-orb" style={{
                width: 300, height: 300,
                background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
                top: '-80px', left: '50%', transform: 'translateX(-50%)',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 40, marginBottom: 16 }}>☁️</p>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
                  Start sharing today
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>
                  Free, fast, and secure. No credit card required.
                </p>
                <Link href="/register" className="btn btn-primary btn-lg">
                  🚀 Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}>
          <p>☁️ <strong style={{ color: 'var(--text)' }}>CloudShare</strong> · Built with Firebase · {new Date().getFullYear()}</p>
        </footer>
      </main>
    </>
  );
}

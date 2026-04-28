'use client';
import { useEffect, useState, use } from 'react';
import { getShareLink, verifySharePassword } from '@/lib/share';
import { formatBytes, getFileIcon, getDownloadUrl } from '@/lib/files';
import Link from 'next/link';

export default function SharePage({ params }) {
  const { token } = use(params);
  const [link, setLink] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | password | ready | expired | invalid
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getShareLink(token);
        if (!data) { setStatus('invalid'); return; }
        if (data.expired) { setStatus('expired'); return; }
        setLink(data);
        setStatus(data.passwordHash ? 'password' : 'ready');
      } catch {
        setStatus('invalid');
      }
    })();
  }, [token]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setPwError('');
    setVerifying(true);
    try {
      const ok = await verifySharePassword(token, password);
      if (ok) setStatus('ready');
      else setPwError('Incorrect password. Please try again.');
    } catch {
      setPwError('Something went wrong.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="glow-orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', top: -150, left: '50%', transform: 'translateX(-50%)' }} />
      </div>

      {/* Navbar */}
      <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          ☁️ CloudShare
        </Link>
        <Link href="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, borderWidth: 3 }} />
            <p>Loading share link...</p>
          </div>
        )}

        {/* Expired */}
        {status === 'expired' && (
          <div className="card animate-fadeInUp" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 400, width: '100%' }}>
            <p style={{ fontSize: 56, marginBottom: 16 }}>⏰</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Link Expired</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This share link has expired and is no longer valid.</p>
            <Link href="/" className="btn btn-ghost" style={{ marginTop: 28, display: 'inline-flex' }}>← Go Home</Link>
          </div>
        )}

        {/* Invalid */}
        {status === 'invalid' && (
          <div className="card animate-fadeInUp" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 400, width: '100%' }}>
            <p style={{ fontSize: 56, marginBottom: 16 }}>🚫</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Link Not Found</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This share link doesn&apos;t exist or has been deleted.</p>
            <Link href="/" className="btn btn-ghost" style={{ marginTop: 28, display: 'inline-flex' }}>← Go Home</Link>
          </div>
        )}

        {/* Password Gate */}
        {status === 'password' && link && (
          <div className="card animate-fadeInUp" style={{ padding: '40px 36px', maxWidth: 420, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Protected File</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>
                <strong style={{ color: 'var(--text)' }}>{link.originalName}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {formatBytes(link.size)} · Enter password to access
              </p>
            </div>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="share-password">Password</label>
                <input
                  id="share-password"
                  type="password"
                  className="form-input"
                  placeholder="Enter the share password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {pwError && <div className="form-error">⚠️ {pwError}</div>}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '14px' }}
                disabled={verifying}
              >
                {verifying ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Verifying...</> : '🔓 Unlock File'}
              </button>
            </form>
          </div>
        )}

        {/* Ready to Download */}
        {status === 'ready' && link && (
          <div className="card animate-fadeInUp" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 440, width: '100%' }}>
            {/* File Icon */}
            <div style={{
              width: 80, height: 80,
              borderRadius: 20,
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, margin: '0 auto 20px',
            }}>
              {getFileIcon(link.mimeType)}
            </div>

            {/* File Info */}
            <h1 style={{
              fontSize: 18, fontWeight: 700, marginBottom: 6,
              wordBreak: 'break-word', lineHeight: 1.4,
            }}>
              {link.originalName}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
              {formatBytes(link.size)}
              {link.expiresAt && (
                <> · Expires {link.expiresAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
              )}
            </p>

            {/* Download Button */}
            <a
              href={getDownloadUrl(link.storageUrl)}
              download={link.originalName}
              className="btn btn-primary btn-lg"
              style={{ display: 'inline-flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}
            >
              ⬇️ Download File
            </a>

            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Shared via ☁️ CloudShare
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, position: 'relative', zIndex: 1 }}>
        <p>Powered by <Link href="/" className="link">CloudShare</Link></p>
      </div>
    </div>
  );
}

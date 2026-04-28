'use client';
import { useState } from 'react';
import { createShareLink } from '@/lib/share';

export default function ShareModal({ file, uid, onClose }) {
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('never');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const token = await createShareLink({
        fileId: file.id,
        fileName: file.originalName,
        originalName: file.originalName,
        storageUrl: file.storageUrl,
        mimeType: file.mimeType,
        size: file.size,
        ownerId: uid,
        password: password || null,
        expiresIn,
      });
      const url = `${window.location.origin}/s/${token}`;
      setShareUrl(url);
    } catch (err) {
      alert('Failed to create link: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 className="modal-title">🔗 Share File</h2>
            <p style={{
              color: 'var(--text-muted)', fontSize: 13,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 340,
            }}>
              {file.originalName}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>

        {!shareUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Password */}
            <div className="form-group">
              <label className="form-label">🔐 Password Protection (optional)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Leave blank for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Expiry */}
            <div className="form-group">
              <label className="form-label">⏱️ Link Expiry</label>
              <select
                className="form-select"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              >
                <option value="never">Never expires</option>
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>

            {/* Info badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {password && <span className="badge badge-purple">🔒 Password protected</span>}
              {expiresIn !== 'never' && <span className="badge badge-cyan">⏱️ Expires in {expiresIn}</span>}
              {!password && expiresIn === 'never' && (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Anyone with the link can download.</span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating...</> : '✨ Create Link'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 24, marginBottom: 4 }}>✅</p>
              <p style={{ fontWeight: 600, color: 'var(--success)' }}>Share link created!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                {password ? '🔒 Password protected · ' : ''}
                {expiresIn !== 'never' ? `⏱️ Expires in ${expiresIn}` : '🔓 Never expires'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Share URL</label>
              <div className="copy-box">
                <span className="copy-box-text">{shareUrl}</span>
                <button
                  className="btn btn-sm"
                  onClick={handleCopy}
                  style={{
                    flexShrink: 0,
                    background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)',
                    color: copied ? 'var(--success)' : 'var(--primary-light)',
                    border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(124,58,237,0.3)',
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Done</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => { setShareUrl(''); setPassword(''); setExpiresIn('never'); }}
              >
                + New Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

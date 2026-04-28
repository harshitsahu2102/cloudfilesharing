'use client';
import { useState, useRef } from 'react';

export default function UploadZone({ onUpload, uploading, progress }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onUpload(files[0]);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--primary-light)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: uploading ? 'default' : 'pointer',
        transition: 'var(--transition)',
        background: dragging
          ? 'rgba(124,58,237,0.06)'
          : uploading
          ? 'rgba(255,255,255,0.02)'
          : 'var(--card)',
        backdropFilter: 'var(--blur)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={uploading}
      />

      {/* Glow when dragging */}
      {dragging && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ fontSize: 48, marginBottom: 16 }}>
        {uploading ? '⏳' : dragging ? '📂' : '☁️'}
      </div>

      {uploading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: 16 }}>Uploading...</p>
          <div style={{ width: '100%', maxWidth: 300 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{progress}%</p>
        </div>
      ) : (
        <>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
            {dragging ? 'Drop it here!' : 'Drag & drop a file'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            or click to browse — up to 50 MB
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {['Images', 'Videos', 'PDFs', 'Archives', 'Docs'].map((t) => (
              <span key={t} className="badge badge-purple">{t}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

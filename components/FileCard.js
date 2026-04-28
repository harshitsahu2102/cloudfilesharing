'use client';
import { useState } from 'react';
import { formatBytes, getFileIcon, deleteFile, getDownloadUrl } from '@/lib/files';
import { deleteShareLink, getUserShareLinks } from '@/lib/share';

export default function FileCard({ file, uid, onDelete, onShare }) {
  const [deleting, setDeleting] = useState(false);
  const [hover, setHover] = useState(false);

  const date = file.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) || 'Just now';

  const handleDelete = async () => {
    if (!confirm(`Delete "${file.originalName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      // Delete associated share links first
      const links = await getUserShareLinks(uid);
      const fileLinks = links.filter((l) => l.fileId === file.id);
      await Promise.all(fileLinks.map((l) => deleteShareLink(l.id)));
      // Delete the file
      await deleteFile(file.id, file.cloudinaryPublicId, file.cloudinaryResourceType, uid, file.size);
      onDelete(file.id);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
      setDeleting(false);
    }
  };

  return (
    <div
      className="card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'var(--transition)',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? 'var(--shadow)' : 'none',
      }}
    >
      {/* Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          fontSize: 32,
          flexShrink: 0,
          background: 'rgba(124,58,237,0.1)',
          borderRadius: 10,
          width: 52,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {getFileIcon(file.mimeType)}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{
            fontWeight: 600,
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 4,
          }}>
            {file.originalName}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {formatBytes(file.size)} · {date}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <a
          href={getDownloadUrl(file.storageUrl)}
          className="btn btn-ghost btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          ⬇️ Download
        </a>
        <button
          className="btn btn-sm"
          style={{
            flex: 1,
            background: 'rgba(124,58,237,0.12)',
            color: 'var(--primary-light)',
            border: '1px solid rgba(124,58,237,0.25)',
            justifyContent: 'center',
          }}
          onClick={() => onShare(file)}
        >
          🔗 Share
        </button>
        <button
          className="btn-icon btn-sm"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete file"
          style={{ color: deleting ? 'var(--text-faint)' : 'var(--danger)', flexShrink: 0 }}
        >
          {deleting ? '⏳' : '🗑️'}
        </button>
      </div>
    </div>
  );
}

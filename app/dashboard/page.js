'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { uploadFile, getUserFiles, formatBytes } from '@/lib/files';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import UploadZone from '@/components/UploadZone';
import FileCard from '@/components/FileCard';
import ShareModal from '@/components/ShareModal';

const MAX_STORAGE = 1073741824; // 1 GB

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareFile, setShareFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async (uid) => {
    try {
      const [userSnap, fileList] = await Promise.all([
        getDoc(doc(db, 'users', uid)),
        getUserFiles(uid),
      ]);
      setUserData(userSnap.data());
      setFiles(fileList);
    } catch (err) {
      showToast('Failed to load files: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      loadData(u.uid);
    });
    return () => unsub();
  }, [router, loadData]);

  const handleUpload = async (file) => {
    if (file.size > 50 * 1024 * 1024) {
      showToast('File too large. Max 50 MB.', 'error');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadFile(file, user.uid, (pct) => setProgress(pct));
      showToast(`✅ "${file.name}" uploaded!`);
      const newFile = {
        id: result.id,
        originalName: file.name,
        fileName: result.storagePath.split('/').pop(),
        mimeType: file.type,
        size: file.size,
        storageUrl: result.downloadURL,
        storagePath: result.storagePath,
        createdAt: { toDate: () => new Date() },
        ownerId: user.uid,
      };
      setFiles((prev) => [newFile, ...prev]);
      setUserData((prev) => prev ? { ...prev, storageUsed: (prev.storageUsed || 0) + file.size } : prev);
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (fileId) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === fileId);
      if (removed) {
        setUserData((u) => u ? { ...u, storageUsed: Math.max(0, (u.storageUsed || 0) - removed.size) } : u);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    showToast('File deleted.');
  };

  const storageUsed = userData?.storageUsed || 0;
  const storagePercent = Math.min((storageUsed / MAX_STORAGE) * 100, 100);
  const filteredFiles = files.filter((f) =>
    f.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loading">
          <div className="spinner" />
          <p>Loading your files...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>

        {/* ── Header ───────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            My Drive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {files.length} file{files.length !== 1 ? 's' : ''}
            {' · '}
            {formatBytes(storageUsed)} used
          </p>
        </div>

        {/* ── Storage Bar ──────────────────── */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Storage</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {formatBytes(storageUsed)} / 1 GB
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${storagePercent}%`,
                  background: storagePercent > 85 ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'var(--gradient)',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-purple">{files.length} Files</span>
            <span className="badge badge-cyan">{formatBytes(MAX_STORAGE - storageUsed)} Free</span>
          </div>
        </div>

        {/* ── Upload Zone ──────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <UploadZone onUpload={handleUpload} uploading={uploading} progress={progress} />
        </div>

        {/* ── Files Section ─────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 700, fontSize: 18 }}>
              Your Files
            </h2>
            {files.length > 0 && (
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 260, padding: '10px 16px', fontSize: 13 }}
              />
            )}
          </div>

          {filteredFiles.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  {search ? '🔍' : '📂'}
                </div>
                <p className="empty-state-title">
                  {search ? 'No files match your search' : 'No files yet'}
                </p>
                <p className="empty-state-desc">
                  {search ? 'Try a different search term.' : 'Upload your first file using the zone above.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="files-grid">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  uid={user.uid}
                  onDelete={handleDelete}
                  onShare={(f) => setShareFile(f)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Share Modal ───────────────────── */}
      {shareFile && (
        <ShareModal
          file={shareFile}
          uid={user.uid}
          onClose={() => setShareFile(null)}
        />
      )}

      {/* ── Toast ─────────────────────────── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}

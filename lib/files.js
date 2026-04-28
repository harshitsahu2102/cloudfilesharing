import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Upload to Cloudinary via unsigned upload preset ─────────────────────────
export function uploadFile(file, uid, onProgress) {
  return new Promise(async (resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `cloudshare/${uid}`);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    // Use XHR for progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        try {
          const docRef = await addDoc(collection(db, 'files'), {
            ownerId: uid,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            storageUrl: data.secure_url,
            cloudinaryPublicId: data.public_id,
            cloudinaryResourceType: data.resource_type,
            createdAt: serverTimestamp(),
          });
          await updateDoc(doc(db, 'users', uid), {
            storageUsed: increment(file.size),
          });
          resolve({
            id: docRef.id,
            downloadURL: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            originalName: file.name,
          });
        } catch (err) {
          reject(err);
        }
      } else {
        const errData = JSON.parse(xhr.responseText);
        reject(new Error(errData?.error?.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

// ─── Get all files for a user ─────────────────────────────────────────────────
export async function getUserFiles(uid) {
  const q = query(
    collection(db, 'files'),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Delete a file ────────────────────────────────────────────────────────────
export async function deleteFile(fileId, publicId, resourceType, uid, fileSize) {
  // Delete from Cloudinary (server-side API route — keeps API secret off client)
  await fetch('/api/delete-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, resourceType }),
  });
  // Delete Firestore record
  await deleteDoc(doc(db, 'files', fileId));
  // Decrement storage tracker
  await updateDoc(doc(db, 'users', uid), {
    storageUsed: increment(-fileSize),
  });
}

// ─── Force-download URL (adds fl_attachment to Cloudinary URL) ────────────────
export function getDownloadUrl(url) {
  if (!url) return url;
  // Insert fl_attachment flag so browser downloads instead of previewing
  return url.replace('/upload/', '/upload/fl_attachment/');
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(mimeType = '') {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
  if (mimeType.includes('text')) return '📃';
  return '📁';
}

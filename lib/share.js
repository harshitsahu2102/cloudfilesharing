import {
  collection,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';

// Simple hash for password (client-side, good enough for share links)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createShareLink({ fileId, fileName, originalName, storageUrl, mimeType, size, ownerId, password, expiresIn }) {
  const token = uuidv4();
  let passwordHash = null;
  if (password) {
    passwordHash = await hashPassword(password);
  }
  let expiresAt = null;
  if (expiresIn && expiresIn !== 'never') {
    const ms = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }[expiresIn];
    expiresAt = Timestamp.fromDate(new Date(Date.now() + ms));
  }

  await addDoc(collection(db, 'shareLinks'), {
    token,
    fileId,
    fileName,
    originalName,
    storageUrl,
    mimeType,
    size,
    ownerId,
    passwordHash,
    expiresAt,
    downloadCount: 0,
    createdAt: serverTimestamp(),
  });

  return token;
}

export async function getShareLink(token) {
  const q = query(collection(db, 'shareLinks'), where('token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  const id = snap.docs[0].id;
  // Check expiry
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return { expired: true };
  }
  return { id, ...data };
}

export async function verifySharePassword(token, password) {
  const link = await getShareLink(token);
  if (!link || link.expired) return false;
  if (!link.passwordHash) return true; // no password
  const hash = await hashPassword(password);
  return hash === link.passwordHash;
}

export async function getUserShareLinks(uid) {
  const q = query(collection(db, 'shareLinks'), where('ownerId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteShareLink(id) {
  await deleteDoc(doc(db, 'shareLinks', id));
}

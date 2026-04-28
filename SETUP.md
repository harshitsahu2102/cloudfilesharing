# ☁️ CloudShare — Setup Guide

This guide walks you through setting up Firebase (Auth + Database) and Cloudinary (File Storage) for CloudShare. Takes about **10 minutes**.

---

## Part 1 — Firebase Setup (Auth + Firestore)

Firebase is used for **user login** and **storing file metadata**. No Firebase Storage needed — files go to Cloudinary.

---

### Step 1 — Create a Firebase Project

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**
2. Click **"Add project"**
3. Name it `cloudshare` (or anything you like)
4. Disable Google Analytics (optional) → Click **"Create project"**
5. Wait for it to finish → Click **"Continue"**

---

### Step 2 — Enable Authentication

1. In the left sidebar, click **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in providers**, enable:
   - **Email/Password** → Toggle on → Save
   - **Google** → Toggle on → enter your project support email → Save

---

### Step 3 — Create Firestore Database

1. In the left sidebar, click **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** → Next
4. Choose a location close to you (e.g., `asia-south1` for India) → Click **"Enable"**
5. Once created, click the **"Rules"** tab
6. **Press `Ctrl+A` to select ALL text in the editor and delete it** — the editor comes pre-filled and pasting on top causes a parse error
7. Paste **exactly** this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /files/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    match /shareLinks/{linkId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow update: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

  }
}
```

> [!CAUTION]
> **Select all → delete → then paste.** `rules_version = '2';` must be the very first character. Nothing before it — no spaces, no comments, no blank lines.

8. Click **"Publish"**

---

### Step 4 — Create Firestore Index

1. Go to **Firestore → Indexes → Composite → Add index**
2. Collection ID: `files`
3. Add field `ownerId` → **Ascending**
4. Add field `createdAt` → **Descending**
5. Click **"Create index"** — takes ~1 minute

> [!NOTE]
> Alternatively, just run the app and click the index-creation link that appears automatically in your browser DevTools console when you first load the dashboard.

---

### Step 5 — Get Your Firebase Config

1. Go to **Project Settings** (⚙️ gear icon → Project settings)
2. Scroll down to **"Your apps"**
3. Click the **`</>`** (Web) icon → Name it `cloudshare-web` → **"Register app"**
4. Copy your config values — you'll need:

```
apiKey
authDomain
projectId
messagingSenderId
appId
```

> [!NOTE]
> You do **not** need `storageBucket` — we're using Cloudinary for storage, not Firebase Storage.

---

## Part 2 — Cloudinary Setup (File Storage)

Cloudinary gives you **25 GB free storage** and **25 GB/month bandwidth** — no credit card required.

---

### Step 6 — Create a Cloudinary Account

1. Go to **[cloudinary.com](https://cloudinary.com)** → Click **"Sign Up for Free"**
2. Enter your email and create an account
3. After signing up, you'll land on the **Dashboard**
4. Note your **Cloud Name** at the top of the dashboard (e.g., `dxyz123abc`)

---

### Step 7 — Create an Unsigned Upload Preset

> An upload preset allows the browser to upload files directly to Cloudinary without exposing your API secret.

1. In the Cloudinary dashboard, go to **Settings → Upload**

   *(Click the gear icon ⚙️ in the top-right, then "Upload")*

2. Scroll down to **"Upload presets"** → Click **"Add upload preset"**
3. Set these options:
   - **Preset name**: type `cloudshare_uploads` ← **this exact name becomes your `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` value**
   - **Signing Mode**: **Unsigned** ← this is important
   - **Folder**: `cloudshare` (optional)
4. Click **"Save"**

> [!NOTE]
> The upload preset is just the **name you typed** — not a generated key. After saving, your `.env.local` value will be:
> ```
> NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=cloudshare_uploads
> ```
> You can find it anytime under **Settings → Upload → Upload presets**.

---

### Step 8 — Get Your Cloudinary API Keys

1. Go to **Cloudinary Dashboard** → Click **"Go to API Keys"** (or Settings → API Keys)
2. Note down:
   - **Cloud Name** (shown on dashboard)
   - **API Key**
   - **API Secret** (click the eye icon to reveal)

---

## Part 3 — Connect Everything

### Step 9 — Add Config to Your Project

1. Copy `.env.local.example` to `.env.local`:
   ```
   copy .env.local.example .env.local
   ```

2. Open `.env.local` and fill in **all** values:

   ```
   # Firebase (Auth + Firestore)
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

   # Cloudinary (File Storage)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=cloudshare_uploads
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

> [!IMPORTANT]
> `CLOUDINARY_API_SECRET` (no `NEXT_PUBLIC_`) is server-side only and is **never** sent to the browser. The other Cloudinary values are safe to be public.

---

### Step 10 — Install & Run

Open a terminal in `d:\cloud 1\` and run:

```bash
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** 🎉

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **"Line 1: Parse error"** in Firestore rules | Select ALL text in the editor (`Ctrl+A`) → Delete → Paste fresh |
| **"The query requires an index"** | Click the link in browser DevTools console to auto-create it |
| **Upload fails with 400 error** | Check `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` matches exactly what you created in Cloudinary |
| **Upload fails with 401 error** | Make sure the upload preset is set to **Unsigned** |
| **Delete fails** | Check `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env.local` |
| **Google Sign-In popup closes** | Go to Firebase → Authentication → Settings → Authorized domains → add `localhost` |
| **"Missing or insufficient permissions"** | Check Firestore rules are published (Step 3) |

---

## ✅ What You Get

- 🔐 Email/Password + Google Sign-In (Firebase Auth)
- 🗄️ File metadata stored in Firestore
- ☁️ Files stored in Cloudinary — **25 GB free, no credit card**
- 🔗 Secure share links with optional password + expiry
- 📊 Storage usage tracker on your dashboard

# Firestore Rules Deployment Guide

## Option 1: Using Firebase Console (Easiest - Recommended)

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **sports-odds-aura**

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click **Firestore Database**
2. Click on the **Rules** tab at the top

### Step 3: Copy and Paste Rules
Copy the entire content from `firebase/firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Odds cache - public read, no write from client
    match /odds_cache/{cacheKey} {
      allow read: if true;
      allow write: if false; // Only server-side writes
    }
  }
}
```

### Step 4: Publish
1. Click the **Publish** button
2. Wait for confirmation that rules are published

✅ **Done!** Your Firestore rules are now deployed.

---

## Option 2: Using Firebase CLI

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
This will open a browser window for authentication.

### Step 3: Initialize Firebase (if not already done)
```bash
firebase init firestore
```
- Select your project: **sports-odds-aura**
- Use existing rules file: `firebase/firestore.rules`
- Don't overwrite if asked (we already have the rules)

### Step 4: Deploy Rules
```bash
firebase deploy --only firestore:rules
```

You should see output like:
```
✔  firestore: released rules firestore.rules to firestore
```

✅ **Done!** Your Firestore rules are now deployed.

---

## Option 3: Using Firebase CLI (Quick - If Already Initialized)

If you've already initialized Firebase in this project:

```bash
firebase deploy --only firestore:rules
```

---

## Verify Rules Are Deployed

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **sports-odds-aura** project
3. Go to **Firestore Database** > **Rules**
4. You should see the rules you just deployed

---

## Troubleshooting

### "firebase: command not found"
- Install Firebase CLI: `npm install -g firebase-tools`

### "Error: No project active"
- Run: `firebase use sports-odds-aura`
- Or: `firebase init` and select your project

### "Permission denied"
- Make sure you're logged in: `firebase login`
- Verify you have admin access to the project

### Rules not updating
- Clear browser cache
- Wait a few minutes for propagation
- Check the Rules tab shows the latest timestamp

---

## What These Rules Do

- **`allow read: if true`** - Anyone can read from the `odds_cache` collection (needed for the widget)
- **`allow write: if false`** - No one can write from the client (only server-side writes via Firebase Admin SDK)

This ensures:
- ✅ Widgets can fetch cached data
- ✅ Only your server can write/update cache
- ✅ Security: Clients cannot modify cache data

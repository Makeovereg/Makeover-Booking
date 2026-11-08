// Firebase adapter: gives the bookings page the same `window.claude.use(name)` interface
// it uses inside Claude (db, user, assets, downloads), backed by Firebase instead.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { initializeFirestore, collection, doc, query, where, orderBy, limit, onSnapshot, getDoc, getDocs, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage, ref as sRef, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

const $ = (s) => document.querySelector(s);
const gate = $('#gate');

function show(state, opts) {
  gate.hidden = false;
  gate.querySelectorAll('[data-g]').forEach((el) => { el.hidden = el.dataset.g !== state; });
  if (opts && opts.email) gate.querySelectorAll('.g-email').forEach((el) => { el.textContent = opts.email; });
  if (opts && opts.error) $('#gErrMsg').textContent = opts.error;
}
function errText(e) {
  const c = (e && e.code) || '';
  if (c === 'auth/unauthorized-domain') return 'عنوان الموقع ده مش مضاف في Firebase. ضيفه من Authentication ← Settings ← Authorized domains.';
  if (c === 'auth/network-request-failed' || c === 'unavailable') return 'مفيش اتصال بالإنترنت. اتأكد من الاتصال وحاول تاني.';
  if (c === 'permission-denied') return 'Firebase رفض الطلب. اتأكد إن قواعد الأمان (Rules) اتنشرت، وإن إيميل المالك مكتوب صح فيها.';
  return 'حصلت مشكلة: ' + ((e && (e.message || e.code)) || 'غير معروفة');
}

const CFG = window.FIREBASE_CONFIG || {};
if (!CFG.apiKey || /PASTE|YOUR_/i.test(CFG.apiKey)) {
  show('error', { error: 'إعدادات Firebase لسه ما اتحطتش في ملف firebase-config.js.' });
  throw new Error('firebase-config.js is not filled in');
}
const OWNERS = (window.OWNER_EMAILS || []).map((e) => String(e).trim().toLowerCase());
const app = initializeApp(CFG);
const auth = getAuth(app);
const fs = initializeFirestore(app, { ignoreUndefinedProperties: true });
const storage = window.ENABLE_UPLOADS && CFG.storageBucket ? getStorage(app) : null;

// ---------- db (Firestore with the page's expected shapes) ----------
const ERR = { 'permission-denied': 'invalid_argument', 'invalid-argument': 'invalid_argument', 'not-found': 'invalid_argument', 'failed-precondition': 'invalid_argument', 'resource-exhausted': 'resource_exhausted', 'unavailable': 'unavailable', 'deadline-exceeded': 'unavailable', 'unauthenticated': 'revoked' };
const mapErr = (e) => ({ code: ERR[e && e.code] || 'unavailable', message: (e && e.message) || '' });
const wrap = (p) => p.catch((e) => { throw mapErr(e); });
const meta = (m) => ({ fromCache: !!(m && m.fromCache), hasPendingWrites: !!(m && m.hasPendingWrites) });
const wrapDS = (s) => { const ex = s.exists(); return { id: s.id, exists: ex, data: () => (ex ? s.data() : undefined), metadata: meta(s.metadata) }; };
const wrapQS = (s) => ({ docs: s.docs.map(wrapDS), size: s.size, empty: s.empty, metadata: meta(s.metadata), docChanges: () => [] });

function wrapDoc(r) {
  return {
    id: r.id, path: r.path,
    get: () => wrap(getDoc(r)).then(wrapDS),
    set: (d) => wrap(setDoc(r, d)),
    update: (d) => wrap(setDoc(r, d, { merge: true })), // deep-merges nested maps like the page expects
    delete: () => wrap(deleteDoc(r)),
    onSnapshot: (next, err) => onSnapshot(r, (s) => next(wrapDS(s)), (e) => err && err(mapErr(e))),
    collection: (p) => wrapCol(collection(r, p)),
  };
}
function wrapQuery(q) {
  return {
    where: (f, op, v) => wrapQuery(query(q, where(f, op, v))),
    orderBy: (f, d) => wrapQuery(query(q, orderBy(f, d || 'asc'))),
    limit: (n) => wrapQuery(query(q, limit(n))),
    get: () => wrap(getDocs(q)).then(wrapQS),
    onSnapshot: (next, err) => onSnapshot(q, (s) => next(wrapQS(s)), (e) => err && err(mapErr(e))),
  };
}
function wrapCol(c) {
  const w = wrapQuery(c);
  w.path = c.path;
  w.doc = (id) => wrapDoc(id ? doc(c, id) : doc(c));
  w.add = async (d) => { const r = doc(c); await wrap(setDoc(r, d)); return wrapDoc(r); };
  return w;
}
const db = { doc: (p) => wrapDoc(doc(fs, p)), collection: (p) => wrapCol(collection(fs, p)) };

// ---------- people (names and photos for the user capability) ----------
function initials(name) {
  const ch = String(name || '?').trim().charAt(0).replace(/[<>&"']/g, '') || '?';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#7a849a"/><text x="32" y="42" font-size="30" text-anchor="middle" fill="#ffffff" font-family="sans-serif">' + ch + '</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const people = {};
const prof = (id, me) => {
  const p = people[id];
  const name = p ? (p.name || p.email || '') : '';
  return { id, name, avatarUrl: (p && p.photo) || initials(name), color: '#7a849a', email: p ? p.email || null : null, isMe: id === me, guest: false };
};

// ---------- downloads ----------
const downloads = {
  save: async ({ filename, data }) => {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'file'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { status: 'saved' };
  },
};

// ---------- assets (Firebase Storage; off until ENABLE_UPLOADS = true) ----------
const assets = storage ? {
  upload: async (blob, opts) => {
    const type = (opts && opts.type) || blob.type || 'application/octet-stream';
    const id = 'uploads/' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    try {
      const r = sRef(storage, id);
      const res = await uploadBytes(r, blob, { contentType: type });
      const url = await getDownloadURL(r);
      return { id, url, sizeBytes: (res.metadata && res.metadata.size) || blob.size, contentType: type };
    } catch (e) {
      const c = e && e.code;
      throw { code: c === 'storage/unauthorized' ? 'not_granted' : c === 'storage/quota-exceeded' ? 'quota_or_state' : c === 'storage/retry-limit-exceeded' ? 'store_unavailable' : 'upstream_error', message: (e && e.message) || '' };
    }
  },
  delete: async (id) => { if (!/^uploads\//.test(String(id))) return { deleted: false }; try { await deleteObject(sRef(storage, id)); return { deleted: true }; } catch (e) { return { deleted: false }; } },
  list: async () => ({ assets: [], usage: {} }),
} : null;

// ---------- sign-in gate ----------
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
$('#gSignIn').addEventListener('click', async () => {
  try { await signInWithPopup(auth, provider); }
  catch (e) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-environment', 'auth/web-storage-unsupported'].includes(e.code)) { await signInWithRedirect(auth, provider); return; }
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') show('error', { error: errText(e) });
  }
});
gate.querySelectorAll('[data-signout]').forEach((b) => b.addEventListener('click', () => signOut(auth).then(() => location.reload())));
getRedirectResult(auth).catch((e) => show('error', { error: errText(e) }));

let booted = false;
onAuthStateChanged(auth, async (u) => {
  if (!u) { show('signin'); return; }
  if (booted) return;
  booted = true;
  try { await boot(u); } catch (e) { booted = false; show('error', { error: errText(e) }); }
});

async function boot(u) {
  show('loading');
  const email = String(u.email || '').toLowerCase();
  const isOwner = OWNERS.includes(email);
  const now = new Date().toISOString();
  await setDoc(doc(fs, 'people', u.uid), { name: u.displayName || email, email, photo: u.photoURL || null, lastSeen: now }, { merge: true });

  const memSnap = await getDoc(doc(fs, 'members', u.uid));
  if (!isOwner && !memSnap.exists()) {
    try { const v = await getDoc(doc(fs, 'visitors', u.uid)); if (!v.exists()) await setDoc(doc(fs, 'visitors', u.uid), { firstSeen: now }); } catch (e) { /* not fatal */ }
    show('waiting', { email });
    onSnapshot(doc(fs, 'members', u.uid), (s) => { if (s.exists()) location.reload(); }, () => {});
    return;
  }

  if (isOwner && window.SEED_CONFIG) {
    const c = await getDoc(doc(fs, 'config', 'main'));
    if (!c.exists()) await setDoc(doc(fs, 'config', 'main'), window.SEED_CONFIG);
  }
  const cs = await getDoc(doc(fs, 'config', 'main'));
  const conf = cs.exists() ? cs.data() : {};
  const role = isOwner ? 'admin' : memSnap.data().role;
  const perms = role === 'admin' ? { settings: true } : (((conf.roles || {})[role] || {}).perms || {});
  const canEdit = isOwner || !!perms.settings;

  let peopleTimer;
  onSnapshot(collection(fs, 'people'), (q) => {
    q.docs.forEach((d) => { people[d.id] = d.data(); });
    clearTimeout(peopleTimer);
    peopleTimer = setTimeout(() => { if (typeof window.renderAll === 'function') window.renderAll(); }, 50);
  }, () => {});

  const name = u.displayName || email;
  const user = {
    isOwner: async () => isOwner,
    canEdit: async () => canEdit,
    can: async (n) => (n === 'data.write' ? true : n === 'assets.write' ? canEdit : n === 'files.write' ? canEdit : false),
    id: async () => u.uid,
    name: async () => name,
    email: async () => email,
    avatarUrl: async () => u.photoURL || initials(name),
    me: async () => ({ id: u.uid, name, avatarUrl: u.photoURL || initials(name), color: '#7a849a', email, isOwner, canEdit }),
    profiles: async (ids) => { const out = {}; (Array.isArray(ids) ? ids : [ids]).forEach((id) => { out[id] = prof(id, u.uid); }); return out; },
    search: async (q) => {
      const s = String(q || '').toLowerCase();
      return Object.keys(people)
        .filter((id) => { const p = people[id]; return !s || String(p.name || '').toLowerCase().includes(s) || String(p.email || '').toLowerCase().includes(s); })
        .slice(0, 8).map((id) => prof(id, u.uid)).filter((p) => p.name);
    },
  };

  const out = $('#btnLogout');
  if (out) { out.hidden = false; out.addEventListener('click', () => signOut(auth).then(() => location.reload())); }
  gate.hidden = true;
  window.__capsReady({ db, user, assets, downloads });
}

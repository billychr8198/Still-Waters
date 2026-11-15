/* ============================================================
   STILL WATERS — accounts and sync (Firebase)
   ------------------------------------------------------------
   The only file that talks to Firebase. It is loaded on demand by
   store.js, and only when firebase-config.js has been filled in.

   Where things live, per person:
     users/{uid}                 { hidden: [ids of built-in prayers they removed] }
     users/{uid}/prayers/{id}    { title, text, removed, createdAt, updatedAt }
     users/{uid}/log/{YYYY-MM}   { days: { "15": { <prayerId>: true, … }, … } }

   Firestore keeps a copy on the device, so the calendar opens instantly,
   works offline, and sends anything logged offline once it reconnects.
============================================================ */

const SDK = 'https://www.gstatic.com/firebasejs/13.3.0';
const LOG = '[Still Waters]';

export async function startCloud(config, handlers) {
  const [A, U, F] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);

  const app = A.initializeApp(config);
  const auth = U.getAuth(app);
  // For local testing against the Firebase emulators (never set on the live site).
  const emu = config.emulators || null;
  if (emu?.auth) U.connectAuthEmulator(auth, emu.auth, { disableWarnings: true });

  let db = null;
  let unsubs = [];
  let uid = null;

  function openDb() {
    if (db) return db;
    try {
      db = F.initializeFirestore(app, {
        localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }),
      });
    } catch (err) {
      db = F.getFirestore(app); // already opened, or this browser can't keep an offline copy
    }
    if (emu?.firestore) {
      try { F.connectFirestoreEmulator(db, emu.firestore[0], emu.firestore[1]); } catch { /* already connected */ }
    }
    return db;
  }

  const userRef = () => F.doc(openDb(), 'users', uid);

  /* ---------- live data ---------- */
  function listen() {
    stopListening();
    const got = { user: null, prayers: null, log: null };
    const meta = {};
    const opts = { includeMetadataChanges: true };

    const push = () => {
      if (!got.user || !got.prayers || !got.log) return; // wait until all three have answered once
      const m = Object.values(meta);
      handlers.onData({
        hidden: got.user.hidden,
        custom: got.prayers,
        log: got.log,
        pending: m.some((x) => x.hasPendingWrites),
        fromCache: m.some((x) => x.fromCache),
      });
    };
    const fail = (err) => {
      const hint = err && err.code === 'permission-denied'
        ? ' The Firestore security rules are probably not published yet (FIREBASE-SETUP.md, step 4).' : '';
      console.warn(`${LOG} Couldn't read your saved prayers.${hint}`, err);
      handlers.onError(err);
    };

    unsubs.push(F.onSnapshot(userRef(), opts, (snap) => {
      meta.user = snap.metadata;
      got.user = { hidden: (snap.exists() && snap.data().hidden) || [] };
      push();
    }, fail));

    unsubs.push(F.onSnapshot(F.collection(userRef(), 'prayers'), opts, (qs) => {
      meta.prayers = qs.metadata;
      const custom = {};
      qs.forEach((d) => { custom[d.id] = { id: d.id, ...d.data() }; });
      got.prayers = custom;
      push();
    }, fail));

    unsubs.push(F.onSnapshot(F.collection(userRef(), 'log'), opts, (qs) => {
      meta.log = qs.metadata;
      const log = {};
      qs.forEach((d) => {
        const days = d.data().days || {};
        for (const [dd, ids] of Object.entries(days)) {
          const on = Object.keys(ids || {}).filter((k) => ids[k]);
          if (on.length) log[`${d.id}-${dd}`] = Object.fromEntries(on.map((k) => [k, true]));
        }
      });
      got.log = log;
      push();
    }, fail));
  }

  function stopListening() {
    unsubs.forEach((u) => u());
    unsubs = [];
  }

  // Forget the offline copy on this device (used when signing out, for shared computers).
  async function closeDb() {
    stopListening();
    if (!db) return;
    const old = db;
    db = null;
    try {
      await F.terminate(old);
      await F.clearIndexedDbPersistence(old);
    } catch (err) {
      /* another tab still has it open, or there was nothing to clear */
    }
  }

  U.onAuthStateChanged(auth, async (user) => {
    if (user) {
      uid = user.uid;
      handlers.onUser({
        uid: user.uid,
        email: user.email || '',
        google: user.providerData.some((p) => p.providerId === 'google.com'),
        password: user.providerData.some((p) => p.providerId === 'password'),
      });
      listen();
    } else {
      const had = uid;
      uid = null;
      await closeDb();
      handlers.onUser(null, had);
    }
  });

  /* ---------- writes (they apply on the device at once and sync in the background) ---------- */
  const quiet = (p) => p.catch((err) => { console.warn(`${LOG} A change couldn't be saved to your account.`, err); handlers.onError(err); });
  const split = (date) => [date.slice(0, 7), date.slice(8, 10)];

  function setLog(date, id, on) {
    const [month, day] = split(date);
    quiet(F.setDoc(F.doc(userRef(), 'log', month),
      { days: { [day]: { [id]: on ? true : F.deleteField() } } }, { merge: true }));
  }

  function setHidden(id, hidden) {
    quiet(F.setDoc(userRef(),
      { hidden: hidden ? F.arrayUnion(id) : F.arrayRemove(id), updatedAt: F.serverTimestamp() }, { merge: true }));
  }

  function savePrayer(p) {
    const { id, ...fields } = p;
    quiet(F.setDoc(F.doc(userRef(), 'prayers', id), fields, { merge: true }));
  }

  function deletePrayer(id) {
    quiet(F.deleteDoc(F.doc(userRef(), 'prayers', id)));
  }

  // Add what was saved on this device before signing in. Nothing already in the account is replaced.
  function mergeIn({ custom, hidden, log }) {
    const batch = F.writeBatch(openDb());
    for (const p of Object.values(custom)) {
      const { id, ...fields } = p;
      batch.set(F.doc(userRef(), 'prayers', id), fields, { merge: true });
    }
    if (hidden.length) batch.set(userRef(), { hidden: F.arrayUnion(...hidden), updatedAt: F.serverTimestamp() }, { merge: true });
    const months = {};
    for (const [date, ids] of Object.entries(log)) {
      const [month, day] = split(date);
      (months[month] ||= {})[day] = ids;
    }
    for (const [month, days] of Object.entries(months)) {
      batch.set(F.doc(userRef(), 'log', month), { days }, { merge: true });
    }
    quiet(batch.commit());
  }

  /* ---------- accounts ---------- */
  async function reauth(password) {
    const user = auth.currentUser;
    if (user.providerData.some((p) => p.providerId === 'password') && password) {
      await U.reauthenticateWithCredential(user, U.EmailAuthProvider.credential(user.email, password));
    } else {
      await U.reauthenticateWithPopup(user, new U.GoogleAuthProvider());
    }
  }

  async function deleteAccount(password) {
    const user = auth.currentUser;
    await reauth(password); // Firebase insists on a fresh sign-in before deleting an account
    const refs = [];
    for (const name of ['prayers', 'log']) {
      const qs = await F.getDocs(F.collection(userRef(), name));
      qs.forEach((d) => refs.push(d.ref));
    }
    refs.push(userRef());
    for (let i = 0; i < refs.length; i += 400) {
      const batch = F.writeBatch(openDb());
      refs.slice(i, i + 400).forEach((r) => batch.delete(r));
      await batch.commit();
    }
    stopListening();
    await U.deleteUser(user);
  }

  return {
    signUp: (email, password) => U.createUserWithEmailAndPassword(auth, email, password),
    signIn: (email, password) => U.signInWithEmailAndPassword(auth, email, password),
    google: async () => {
      const result = await U.signInWithPopup(auth, new U.GoogleAuthProvider());
      return { user: result.user, isNew: !!U.getAdditionalUserInfo(result)?.isNewUser };
    },
    resetPassword: (email) => U.sendPasswordResetEmail(auth, email),
    signOut: () => U.signOut(auth),
    deleteAccount,
    setLog, setHidden, savePrayer, deletePrayer, mergeIn,
  };
}

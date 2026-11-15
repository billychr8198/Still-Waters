# Turning on accounts (Firebase)

The Prayers and Calendar tabs work as soon as the files are uploaded: each visitor's
list and calendar are saved in their own browser. This guide switches on **accounts**,
so people can sign in and see the same list and calendar on every device.

It takes about ten minutes, needs no credit card, and uses Firebase's free "Spark" plan.
Button names in the Firebase console change a little from time to time; the steps stay the same.

## 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with your Google account.
2. **Create a project** (or "Add project"). Name it, for example, `still-waters`.
3. Google Analytics is not needed. You can switch it off.

## 2. Switch on sign-in

1. In the left menu: **Build → Authentication → Get started**.
2. On the **Sign-in method** tab, enable **Email/Password** and save.
3. Enable **Google** as well, choose your support email, and save.
   (To leave Google out, skip this and delete the "Continue with Google" button
   from `js/prayers/ui.js`.)

## 3. Tell Firebase where your site lives

1. Still in Authentication: **Settings → Authorized domains → Add domain**.
2. Add `billychr8198.github.io`.
3. If you test on your own computer and `localhost` is not on the list, add it too.

Without this step, "Continue with Google" shows "This website address isn't approved for sign-in yet."

## 4. Create the database

1. Left menu: **Build → Firestore Database → Create database**.
2. Pick a location near most of your visitors. It can't be changed later.
3. Choose **Start in production mode** and create it.
4. Open the **Rules** tab, delete what is there, paste in the whole of
   [`firestore.rules`](firestore.rules) from this repository, and press **Publish**.

Those rules are what keep each person's prayers private: someone signed in can read and
change only their own data.

## 5. Connect the site to the project

1. Click the gear icon → **Project settings**. Under **Your apps**, click the web icon `</>`.
2. Give it a nickname (e.g. `Still Waters web`). Leave "Firebase Hosting" unticked. Register.
3. Firebase shows a block that starts `const firebaseConfig = { … }`.
4. Open `js/prayers/firebase-config.js` and copy each value into the matching line:

   ```js
   export const firebaseConfig = {
     apiKey: 'AIza…',
     authDomain: 'still-waters-xxxxx.firebaseapp.com',
     projectId: 'still-waters-xxxxx',
     storageBucket: 'still-waters-xxxxx.firebasestorage.app',
     messagingSenderId: '1234567890',
     appId: '1:1234567890:web:abcdef…',
   };
   ```

5. Upload the changed `firebase-config.js` to GitHub.

These values are safe to publish. They are not passwords; they only say which Firebase
project the site talks to. GitHub may still email you that it "found a Google API key":
for a Firebase web key that is expected.

## 6. Check that it works

1. Open the site. A **Sign in** button now appears at the top right.
2. Create an account, open the Calendar tab and mark a prayer. The line under the heading
   should read "Synced to your account".
3. Open the site on your phone, sign in with the same account: the same prayer is marked.
   Mark another on the phone and it appears on the computer within a second or two.
4. In the Firebase console, **Firestore Database → Data** now shows a `users` collection.
5. To check privacy, open **Firestore Database → Rules → Rules Playground** (if shown),
   simulate a `get` on `/users/someone-else` while signed in as a different user: it must be denied.

## What is stored

| Where | What |
|---|---|
| Authentication | Each person's email address (and a scrambled password; nobody can read it) |
| `users/{id}` | Which built-in prayers that person removed from their list |
| `users/{id}/prayers/…` | Prayers that person added |
| `users/{id}/log/2026-11` | Which prayers they recited on each day of that month |

People can sign out, reset a forgotten password, and delete their account with everything
in it, all from the **Account** button.

## Limits of the free plan

The Spark plan allows roughly 50,000 reads and 20,000 writes a day. Marking a prayer is one
write, and opening the site reads a handful of documents, so a personal or parish-sized
site stays far inside that. If a limit is ever hit, syncing pauses until the next day and
nothing is charged.

## If something goes wrong

Open the browser console (F12). Messages from this feature start with `[Still Waters]`.

| What you see | Usual cause |
|---|---|
| No **Sign in** button | `firebase-config.js` is still empty, or the new file wasn't uploaded |
| "This way of signing in isn't switched on for this site yet." | Step 2 |
| "This website address isn't approved for sign-in yet." | Step 3 |
| "…your saved prayers couldn't be reached." | Step 4: the rules weren't published |

# Transcript Highlights

## Highlight 1 — Mark Watched & Delete Buttons Not Working
When the mark watched and delete buttons stopped working after adding search/filter functionality, the root cause turned out to be that `Array.indexOf()` compares by object reference — but every call to `JSON.parse()` creates brand new objects, so the lookup always returned `-1`. This matters because it shows how JavaScript's reference vs. value equality can cause silent bugs that are hard to spot without understanding how the language handles objects under the hood.

## Highlight 2 — Migrating from localStorage to Firebase Firestore
The entire data layer was replaced — swapping `localStorage.getItem/setItem` for `addDoc`, `updateDoc`, `deleteDoc`, and a real-time `onSnapshot` listener. This was a major architectural shift because it meant every user now has their own persistent watchlist that syncs across devices, which is the foundation that made auth, profiles, and stats all possible.

## Highlight 3 — Debugging the Firebase Auth CORS Error
After the app worked locally, opening `app.html` directly from the desktop (`file://`) broke everything with a CORS error. This was an important lesson: ES modules and Firebase require the app to be served over HTTP — you can't just double-click an HTML file. Running `npx serve .` locally and deploying to Netlify for production both solved this for the same reason.

## Highlight 4 — CSS Breaking from Repeated Appending
Throughout the project, new styles were appended to `style.css` after every feature, which gradually introduced duplicate and conflicting rules — for example `#auth-section input` was defined twice, and a `align-items: flex-start` fix for the body accidentally misaligned the avatar icon. This highlighted why it's important to maintain a single source of truth for styles rather than continuously patching the bottom of a file.

## Highlight 5 — Fixing the Netlify Deployment
The app failed to deploy with a `500 InternalServerError` when dragging the folder onto Netlify, which was resolved by zipping the folder first before uploading. After deploying, Firebase Auth also blocked sign-ins on the live URL until the Netlify domain was added to Firebase's authorized domains list — a small but critical step that's easy to miss when moving from local development to production.
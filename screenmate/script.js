import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged, updateEmail }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc,
         doc, getDoc, setDoc, query, where, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBBolhmBeL8i1On-XD-L0ay2gV1j_901Q",
  authDomain: "screenmate-b9bb6.firebaseapp.com",
  projectId: "screenmate-b9bb6",
  storageBucket: "screenmate-b9bb6.firebasestorage.app",
  messagingSenderId: "574122592850",
  appId: "1:574122592850:web:462f21a3cf5e42586a6d8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentFilter = "all";
let currentSearch = "";
let movies = [];
let selectedColor = "#6c63ff"; // default avatar color

// --- AUTH SCREEN TOGGLE ---

document.getElementById("go-signin").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("signin-form").style.display = "block";
  clearAuthError();
});

document.getElementById("go-signup").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signin-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
  clearAuthError();
});

// --- AUTH ---

document.getElementById("signup-btn").addEventListener("click", async () => {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  if (!name) return showAuthError("Please enter your name.");
  if (!email) return showAuthError("Please enter your email.");
  if (password.length < 6) return showAuthError("Password must be at least 6 characters.");
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", result.user.uid), { name, email, avatarColor: "#6c63ff" });
  } catch (e) {
    showAuthError(e.message);
  }
});

document.getElementById("signin-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    showAuthError(e.message);
  }
});

document.getElementById("signout-btn").addEventListener("click", () => signOut(auth));

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.style.display = "block";
}
function clearAuthError() {
  const el = document.getElementById("auth-error");
  el.textContent = "";
  el.style.display = "none";
}

// --- AUTH STATE ---

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";
    await loadUserProfile(user);
    listenToMovies(user.uid);
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app-section").style.display = "none";
    movies = [];
    updateStats();
    renderMovies();
  }
});

// --- PROFILE ---

async function loadUserProfile(user) {
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const { name, avatarColor } = userDoc.data();
    selectedColor = avatarColor || "#6c63ff";
    setAvatarUI(name, selectedColor);
  }
}

function setAvatarUI(name, color) {
  const avatar = document.getElementById("user-avatar");
  avatar.textContent = name.charAt(0).toUpperCase();
  avatar.style.backgroundColor = color;
  document.getElementById("user-name").textContent = name;
}

// Open modal
document.getElementById("open-profile-btn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const { name, email, avatarColor } = userDoc.data();
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-email").value = email;
    selectedColor = avatarColor || "#6c63ff";

    // Update preview
    const preview = document.getElementById("profile-avatar-preview");
    preview.textContent = name.charAt(0).toUpperCase();
    preview.style.backgroundColor = selectedColor;

    // Highlight active swatch
    document.querySelectorAll(".color-swatch").forEach(s => {
      s.classList.toggle("active", s.dataset.color === selectedColor);
    });
  }
  document.getElementById("profile-modal").style.display = "flex";
  clearProfileError();
});

// Close modal
document.getElementById("close-profile-btn").addEventListener("click", () => {
  document.getElementById("profile-modal").style.display = "none";
});

// Close modal on backdrop click
document.getElementById("profile-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("profile-modal")) {
    document.getElementById("profile-modal").style.display = "none";
  }
});

// Color swatches
document.querySelectorAll(".color-swatch").forEach(swatch => {
  swatch.addEventListener("click", () => {
    selectedColor = swatch.dataset.color;
    document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
    swatch.classList.add("active");
    const name = document.getElementById("edit-name").value.trim();
    const preview = document.getElementById("profile-avatar-preview");
    preview.style.backgroundColor = selectedColor;
    if (name) preview.textContent = name.charAt(0).toUpperCase();
  });
});

// Live preview name initial
document.getElementById("edit-name").addEventListener("input", (e) => {
  const val = e.target.value.trim();
  const preview = document.getElementById("profile-avatar-preview");
  preview.textContent = val ? val.charAt(0).toUpperCase() : "?";
});

// Save profile
document.getElementById("save-profile-btn").addEventListener("click", async () => {
  const user = auth.currentUser;
  const name = document.getElementById("edit-name").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  if (!name) return showProfileError("Name cannot be empty.");
  if (!email) return showProfileError("Email cannot be empty.");
  try {
    // Update Firestore
    await setDoc(doc(db, "users", user.uid), { name, email, avatarColor: selectedColor });
    // Update Auth email if changed
    if (email !== user.email) {
      await updateEmail(user, email);
    }
    setAvatarUI(name, selectedColor);
    document.getElementById("profile-modal").style.display = "none";
  } catch (e) {
    showProfileError(e.message);
  }
});

function showProfileError(msg) {
  const el = document.getElementById("profile-error");
  el.textContent = msg;
  el.style.display = "block";
}
function clearProfileError() {
  const el = document.getElementById("profile-error");
  el.textContent = "";
  el.style.display = "none";
}

// --- STATS + PROGRESS BAR ---

function updateStats() {
  const total = movies.length;
  const watched = movies.filter(m => m.watched).length;
  const unwatched = total - watched;
  const percent = total === 0 ? 0 : Math.round((watched / total) * 100);
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-watched").textContent = watched;
  document.getElementById("stat-unwatched").textContent = unwatched;
  document.getElementById("progress-percent").textContent = percent + "%";
  document.getElementById("progress-fill").style.width = percent + "%";
}

// --- FIRESTORE ---

function listenToMovies(uid) {
  const q = query(collection(db, "movies"), where("uid", "==", uid));
  onSnapshot(q, (snapshot) => {
    movies = snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
    updateStats();
    renderMovies();
  });
}

async function addMovie(title, genre) {
  const user = auth.currentUser;
  await addDoc(collection(db, "movies"), {
    uid: user.uid, title, genre, watched: false, rating: 0, createdAt: new Date()
  });
}
async function deleteMovie(firestoreId) {
  await deleteDoc(doc(db, "movies", firestoreId));
}
async function toggleWatched(firestoreId, current) {
  await updateDoc(doc(db, "movies", firestoreId), { watched: !current });
}
async function setRating(firestoreId, rating) {
  await updateDoc(doc(db, "movies", firestoreId), { rating });
}

// --- RENDER ---

function renderMovies() {
  const movieList = document.getElementById("movie-list");
  if (!movieList) return;
  movieList.innerHTML = "";

  let filtered = [...movies];
  if (currentFilter === "watched") filtered = filtered.filter(m => m.watched);
  else if (currentFilter === "unwatched") filtered = filtered.filter(m => !m.watched);
  if (currentSearch) {
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }

  if (filtered.length === 0) {
    movieList.innerHTML = `<li class="empty">No movies found.</li>`;
    return;
  }

  filtered.forEach((movie) => {
    const li = document.createElement("li");
    const titleSpan = document.createElement("span");
    titleSpan.className = "movie-title" + (movie.watched ? " watched-title" : "");
    titleSpan.textContent = `${movie.title} (${movie.genre || "No genre"})`;

    const bottomRow = document.createElement("div");
    bottomRow.className = "bottom-row";
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const watchBtn = document.createElement("button");
    watchBtn.className = "watch-btn";
    watchBtn.textContent = movie.watched ? "✅ Watched" : "⬜ Mark Watched";
    watchBtn.addEventListener("click", () => toggleWatched(movie.firestoreId, movie.watched));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "🗑 Delete";
    deleteBtn.addEventListener("click", () => deleteMovie(movie.firestoreId));

    btnGroup.appendChild(watchBtn);
    btnGroup.appendChild(deleteBtn);

    if (movie.watched) {
      const stars = createStarRating(movie);
      bottomRow.appendChild(stars);
    }

    bottomRow.appendChild(btnGroup);
    li.appendChild(titleSpan);
    li.appendChild(bottomRow);
    movieList.appendChild(li);
  });
}

// --- STARS ---

function createStarRating(movie) {
  const container = document.createElement("div");
  container.className = "star-rating";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.className = "star" + (i <= (movie.rating || 0) ? " filled" : "");
    star.dataset.value = i;
    star.addEventListener("mouseover", () => highlightStars(container, i));
    star.addEventListener("mouseout", () => highlightStars(container, movie.rating || 0));
    star.addEventListener("click", () => setRating(movie.firestoreId, movie.rating === i ? 0 : i));
    container.appendChild(star);
  }
  return container;
}
function highlightStars(container, value) {
  container.querySelectorAll(".star").forEach(star => {
    star.classList.toggle("filled", parseInt(star.dataset.value) <= value);
  });
}

// --- FORM ---

const form = document.getElementById("movie-form");
const toggleFormBtn = document.getElementById("toggle-form-btn");
const cancelBtn = document.getElementById("cancel-btn");

toggleFormBtn.addEventListener("click", () => { form.style.display = "flex"; toggleFormBtn.style.display = "none"; });
cancelBtn.addEventListener("click", () => { form.style.display = "none"; toggleFormBtn.style.display = "inline-block"; form.reset(); });
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  if (!title) return;
  await addMovie(title, genre);
  form.reset();
  form.style.display = "none";
  toggleFormBtn.style.display = "inline-block";
});

// --- FILTERS ---

document.getElementById("filter-all").addEventListener("click", () => { currentFilter = "all"; renderMovies(); });
document.getElementById("filter-watched").addEventListener("click", () => { currentFilter = "watched"; renderMovies(); });
document.getElementById("filter-unwatched").addEventListener("click", () => { currentFilter = "unwatched"; renderMovies(); });
document.getElementById("search-bar").addEventListener("input", (e) => { currentSearch = e.target.value; renderMovies(); });

// --- NEXT TO WATCH ---

document.getElementById("next-to-watch-btn").addEventListener("click", () => {
  const unwatched = movies.filter(m => !m.watched);
  const result = document.getElementById("next-to-watch-result");
  const text = document.getElementById("next-movie-text");
  if (unwatched.length === 0) {
    text.textContent = "No unwatched movies! Add some first.";
  } else {
    const pick = unwatched[Math.floor(Math.random() * unwatched.length)];
    text.textContent = `Watch next: ${pick.title}${pick.genre ? " (" + pick.genre + ")" : ""}`;
  }
  result.style.display = "flex";
});
document.getElementById("close-next").addEventListener("click", () => {
  document.getElementById("next-to-watch-result").style.display = "none";
});
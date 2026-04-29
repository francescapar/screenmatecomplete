# ScreenMate (Complete Tier)

## Project Description
ScreenMate is a full-stack movie and TV tracker. Users can sign up, log in, create a watchlist, mark items as watched/unwatched, and rate favorites with stars. Data is saved in Firebase Firestore so each user has their own personalized list.

## Technologies Used
- HTML, CSS, JavaScript
- Firebase Auth for user authentication
- Firebase Firestore for cloud data persistence
- AI Tool: Claude Code for coding, debugging, and planning

## Features
1. User authentication (sign up, login, logout)
2. Add movies or TV shows to watchlist
3. Mark movies as watched or unwatched
4. Delete movies from watchlist
5. Rate movies with star ratings
6. Search movies by title
7. Track watch progress percentage
8. Filter by watched/unwatched

## Setup Instructions
1. Clone the repository: `git clone <repo-url>`
2. Open `index.html` in a web browser (or deploy via GitHub Pages / Netlify / Vercel)
3. Sign up for an account to start tracking movies

## Known Bugs / Limitations
- No external movie database integration
- Star ratings are numeric only
- No movie image uploads

## Architecture Overview
- **Frontend:** HTML/CSS/JS handles UI and local state
- **Backend:** Firebase Auth manages users; Firestore stores user-specific watchlist data
- **Data Flow:** When a user logs in, their watchlist is loaded from Firestore. CRUD actions (add, delete, update, rate) are synced to Firestore.

## What I Learned
Using Claude Code helped me structure a cloud-based watchlist and implement authentication. I learned to manage user-specific data securely and integrate Firestore with a dynamic frontend. AI accelerated generating helper functions and debugging complex async operations while I focused on user experience.
ScreenMateOverview

ScreenMate is a full-stack movie and TV tracking application that allows users to build a personal watchlist, track what they have watched, rate content, and monitor their viewing progress. Each user has a private account, and all data is stored in Firebase Firestore.

The app demonstrates full CRUD functionality, authentication, and real-time UI updates tied to a cloud database.

Live Features
    User authentication (sign up, login, logout)
    Add movies or TV shows to a watchlist
    Mark items as watched or unwatched
    Delete items from the watchlist
    Rate movies using a star system
    Search movies by title
    Filter by watched/unwatched status
    Real-time progress tracking of watched items

How to Run the Project
1. Clone the repository:
git clone <repo-url>
2. Open the project:
Open index.html in a browser OR Deploy using GitHub Pages, Netlify, or Vercel
3. Create an account and start adding movies

Technologies Used
    HTML, CSS, JavaScript
    Firebase Authentication
    Firebase Firestore (database)
    AI-assisted development using Claude Code (for debugging, planning, and feature implementation)

Architecture
    Frontend handles UI rendering and user interactions
    Firebase Auth manages user sessions
    Firestore stores each user’s watchlist data
    CRUD operations sync directly between UI and Firestore in real time
    Data flow:
        User action → Frontend event → Firestore update → UI re-render

Key Improvements & Optimizations
    Fixed ID mismatch issues in Firestore document handling
    Replaced unreliable index-based operations with unique document IDs
    Improved event handling by removing inline onclick and using event listeners
    Added real-time search and filtering functionality
    Optimized render logic to prevent incorrect state updates

Known Limitations
    No external movie database integration (manual entry only)
    Star ratings are numeric only (no half-stars or metadata)
    No image uploads or posters for movies
    UI is functional but not fully responsive on all screen sizes
    
What I Learned

This project helped me understand how to build a full-stack application using Firebase for authentication and database management. I learned how to manage user-specific data securely, debug real-time sync issues, and improve frontend architecture for dynamic state updates. I also gained experience identifying and fixing logic bugs related to ID mismatches and event handling in JavaScript.
# GoFast Repository Architecture

## Overview

This document outlines the high-level architecture of the GoFast ecosystem, detailing the purpose and interaction of its main components. This separation of concerns is critical for maintainability, scalability, and clear development pathways, especially when integrating new services.

## 1. GoFastLanding (Marketing Front Door)

*   **Purpose:** This is the public-facing marketing website for GoFast. Its primary role is SEO, brand presence, and lead generation.
*   **Technology:** Pure HTML, CSS, and JavaScript (no React).
*   **Content:** Includes "About Us", "Privacy Policy", and other static marketing content.
*   **Call to Action (CTA):** Features a prominent "Start Here" button that directs users to the main GoFast application.
*   **URL:** `https://gofastcrushgoals.com/`
*   **Key Principle:** This repository is *not* the application itself; it's the marketing gateway.

## 2. GoFast Frontend (The Actual App)

*   **Purpose:** This is the main user-facing application where athletes interact with GoFast features (RunCrew, Activity, Profile, etc.).
*   **Repositories:**
    *   `gofastfrontend-demo`: A demonstration frontend for visualizing features and data flow before full implementation. This is where we iterate on UI/UX and identify backend data needs.
    *   `gofastfrontend-mvp1`: The actual production-ready frontend for the initial MVP1 (RunCrew focus).
*   **Technology:** React.js, Vite, TailwindCSS, Firebase Client SDK for authentication.
*   **Entry Point:** The `StartHereExplainer.jsx` page (formerly `GoFastPlatform.jsx`) serves as the initial app entry, explaining the core features (Connect, Train, Shop) and guiding users.
*   **Authentication:** Handled entirely on the frontend using Firebase Client SDK.
*   **URL:** `https://app.gofastcrushgoals.com/` (This URL will point to `gofastfrontend-mvp1` in production).

## 3. GoFast Backend (Data & Business Logic)

*   **Repository:** `gofastbackend-sql-fall25`
*   **Purpose:** Provides API endpoints for all data operations and complex business logic. It is the single source of truth for GoFast data.
*   **Technology:** Node.js (Express), Prisma ORM, Firebase Admin SDK for token verification.
*   **Database:** Connects to a PostgreSQL database.
*   **Hosting:** Deployed on Render.
*   **Authentication:** Verifies Firebase ID tokens from the frontend using `firebaseMiddleware.js` and links Firebase users to internal `Athlete` records via `athleteCreateRoute.js`. It does *not* handle user login/signup directly.
*   **URL:** `https://gofastbackend-sql-fall25.onrender.com`
*   **Key Principle:** Backend is **data only**, frontend is **auth only**.

## 4. PostgreSQL Database

*   **Type:** PostgreSQL
*   **Hosting:** Hosted on Render.
*   **Connection:** Accessed by the `gofastbackend-sql-fall25` via a `DATABASE_URI` environment variable.
*   **Administration:** Can be managed and viewed using tools like `pgAdmin` (see below).

## 5. Integrations

*   **Firebase:** Used for user authentication (frontend) and token verification (backend).
*   **Garmin Connect API:** Planned for activity data synchronization.
*   **Strava API:** Future integration for activity data.

## 6. Database Administration (pgAdmin)

*   **Purpose:** `pgAdmin` is a graphical tool for PostgreSQL database administration. It allows you to view schemas, tables, indexes, and run ad-hoc queries.
*   **Deployment:** Can be deployed as a separate service on Render (not part of your main repositories).
*   **Use Case:** Primarily for development, debugging, and direct database management outside of your application code.
*   **Recommendation:** You don't *need* to deploy `pgAdmin` if your primary database interaction is through your backend application (using Prisma). However, it's very useful for developers who need to inspect data or manage the database schema manually.

## Key URLs

*   **Marketing Site:** `https://gofastcrushgoals.com/`
*   **Main App:** `https://app.gofastcrushgoals.com/`
*   **Backend API:** `https://gofastbackend-sql-fall25.onrender.com`
*   **Database:** PostgreSQL hosted on Render (accessed via `DATABASE_URI`)

## Development Workflow

1.  **Marketing:** Update `GoFastLanding` for public-facing content.
2.  **Frontend Development:** Use `gofastfrontend-demo` to prototype and visualize features.
3.  **Backend Development:** Implement API endpoints in `gofastbackend-sql-fall25`.
4.  **Production:** Deploy `gofastfrontend-mvp1` as the live application.

This architecture ensures a clear separation of concerns and provides a scalable foundation for future growth.

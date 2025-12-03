# BIR eServices (Revamped) - System Documentation

## 1. System Overview
**BIR eServices (Revamped)** is a modernized web application designed to streamline taxpayer interactions with the Bureau of Internal Revenue. It features a unified login system, a centralized dashboard for managing tax forms and payments, and a forward-looking Web3/Blockchain integration module.

The system is built with a **"Mobile-First"** and **"Apple-inspired"** design philosophy, utilizing glassmorphism, clean typography (Inter font), and smooth transitions to ensure a premium user experience.

### Tech Stack
*   **Frontend:** HTML5, CSS3 (Custom Variables, Flexbox/Grid, Animations), Vanilla JavaScript.
*   **Backend:** Node.js, Express.js.
*   **Database:** PostgreSQL (via Prisma ORM translated into railway).
*   **Deployment:** Vercel (Frontend/Static), Railway (Database/Backend).

---

## 2. Key Features & Implementation

### A. Authentication & Security
*   **Unified Login:** Single sign-on for all eServices.
*   **Secure Signup:** Captures Taxpayer Identification Number (TIN), email, and personal details.
*   **Implementation:** Uses `bcrypt` for password hashing and Prisma for database persistence.

### B. Dashboard
*   **Action Cards:** Quick access to "Form Simulation", "Payments", "Transactions", and "Business Registration".
*   **Dynamic User Profile:** Displays user's name and avatar (generated from initials) upon login.
*   **Responsive Grid:** Adapts layout for mobile and desktop views.

### C. Web3 & Blockchain Module
*   **Informational Page:** A dedicated section explaining the future of taxation using blockchain technology.
*   **Design:** Features a distinct "Deep Blue & Neon Green" theme (`web3-style.css`) with CSS animations representing blockchain blocks.
*   **Navigation:** Accessible via a specialized neon-glow button on the dashboard.

### D. User Experience (UX) Enhancements
*   **Page Transition Loader:** A custom blue progress bar loader (`loader.js`) appears during navigation between pages to provide visual feedback.
*   **Glassmorphism:** Extensive use of `backdrop-filter: blur()` and semi-transparent backgrounds for a modern look.

---

## 3. System Workflow and User Journey

1.  **Landing Page (`index.html`):**
    *   Users arrive at the landing page featuring the "Welcome" hero section and feature highlights.
    *   Users can navigate to **Login**, **Sign Up**, or the **Web3** page.

2.  **Authentication:**
    *   **Sign Up:** User enters details -> Data sent to `/signup` endpoint -> User created in DB.
    *   **Login:** User enters credentials -> Data sent to `/login` endpoint -> Token/Session established -> Redirect to Dashboard.

3.  **Dashboard (`dashboard.html`):**
    *   Upon successful login, the user is directed here.
    *   The system checks `localStorage` for user data to populate the greeting.
    *   Users can click Action Cards to navigate to specific tools (e.g., `form-sim.html`, `payments.html`).
    *   When the user is new, the only available action card is 'register business'. Once registering a business and approved by an administrator, only then will every other tool be unlocked.

4.  **Web3 Page (`web3-blockchain.html`):**
    *   A standalone page used for scalable web3 and blockchain solutions.

---

## 4. Getting Started

### Prerequisites
*   **Node.js** (v16 or higher)
*   **npm** or **bun**
*   **PostgreSQL Database** (Local or Cloud)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Tasseract/BIRrevamped.git
    cd BIRrevamped
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/bir_db?schema=public"
    PORT=3000
    ```

4.  **Database Migration:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Locally:**
    ```bash
    npm start
    ```
    The server will start at `http://localhost:3000`.

---

## 5. Deployment

The project is configured for deployment on **Vercel**.

### Configuration Files
*   **`vercel.json`:** Configures Vercel to serve the project as a static site (or hybrid if using Vercel Functions).
*   **`scripts/prepare-vercel.js`:** A build script that organizes static assets into a `public/` folder to ensure Vercel serves them correctly.

### Deployment Steps
1.  Push changes to the `main` branch on GitHub.
2.  Connect the repository to Vercel.
3.  Vercel will automatically detect the `package.json` and run the `build` script.
4.  The site will be deployed to your Vercel URL (e.g., `https://bir-revamped.vercel.app`).

---

## 6. Project Structure

```
BIRrevamped/
├── src/                  # (Legacy/Unused React source files)
├── prisma/               # Database schema and migrations
│   └── schema.prisma
├── scripts/              # Build and utility scripts
│   ├── generate-api-config.js
│   └── prepare-vercel.js
├── public/               # Generated during build for Vercel
├── index.html            # Landing Page
├── dashboard.html        # Main User Dashboard
├── login.html            # Login Page
├── signup.html           # Registration Page
├── web3-blockchain.html  # Web3 Feature Page
├── style.css             # Main Global Stylesheet
├── web3-style.css        # Specific Styles for Web3 Page
├── loader.css            # Styles for Page Transition Loader
├── loader.js             # Logic for Page Transition Loader
├── server.js             # Express Backend Server
├── package.json          # Dependencies and Scripts
└── vercel.json           # Vercel Configuration
```

---

## 7. Recent Updates & Changelog
*   **Refactor:** Moved all core HTML files to the root directory for simpler static serving.
*   **Design:** Implemented "Apple-style" buttons and inputs; Redesigned Web3 page with Neon/Dark theme.
*   **Feature:** Added `loader.js` for smooth page transitions.
*   **Fix:** Resolved Vercel deployment issues by adding `prepare-vercel.js` script.

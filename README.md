<div align="center">

# 🎮 Haunt the Arena — Halloween Esports Tournament

### _"Enter if you dare — The Ultimate Halloween Esports Battle Awaits!"_

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**A fully immersive, Halloween-themed esports tournament platform built for Vedam Esports — featuring Tekken 7 (1v1) and BGMI Arena (4v4) knockout tournaments with real-time registration, live brackets, an admin dashboard, and stunning Three.js WebGL visuals.**

_Powered by **Code Nexus**_

---

</div>

## 📸 Overview

This is a production-ready esports tournament website designed for the **"Haunt the Arena"** Halloween gaming event on **October 31, 2025**. It provides a complete tournament management experience — from player/team registration through bracket generation to winner selection — all wrapped in a spooky, high-performance UI with 3D particle effects and immersive animations.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🎃 **Halloween Theme** | Fully themed UI with glitch text, neon glows, fog effects, and horror-inspired typography |
| 🌌 **Three.js 3D Background** | WebGL-powered floating particle system with spectral effects and parallax scrolling |
| 🥊 **Tekken 7 Tournament** | 1v1 single elimination knockout on PC/Console |
| 🎯 **BGMI Arena Tournament** | 4v4 TDM knockout format on Mobile (Warehouse map) |
| 📝 **Multi-Step Registration** | Animated form wizard with real-time validation and game-specific fields |
| ⏱️ **Live Countdown Timer** | Animated flip-clock counting down to event day with urgency effects |
| 🏆 **Tournament Brackets** | Interactive single-elimination bracket viewer with real-time updates |
| 👨‍💼 **Admin Dashboard** | Authenticated admin panel for managing registrations, brackets, and winners |
| 🔥 **Firebase Backend** | Firestore for data, Firebase Auth for admin access, Firebase Hosting ready |
| 📱 **Fully Responsive** | Mobile-first design optimized across all screen sizes |
| 🎵 **Audio System** | Contextual UI sounds (hover, click, success, error) with mute toggle |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic markup and page structure |
| **CSS3** | Styling, animations, responsive layouts, custom properties |
| **Vanilla JavaScript (ES6+)** | Application logic, DOM manipulation, event handling |
| **Three.js (r128)** | WebGL 3D particle background and visual effects |

### Backend & Infrastructure

| Technology | Purpose |
|---|---|
| **Firebase Firestore** | NoSQL real-time database for registrations, tournaments, brackets |
| **Firebase Authentication** | Secure admin login with email/password |
| **Firebase Hosting** | Production deployment with CDN and SSL |
| **Firestore Security Rules** | Granular read/write access control |

### Design

| Technology | Purpose |
|---|---|
| **Google Fonts** | Orbitron, Exo 2, Inter, JetBrains Mono, Fira Code, Creepster |
| **CSS Keyframe Animations** | Glitch effects, fog movement, neon pulses, card flips, typewriter text |
| **Web Audio API** | Spatial UI sound effects |

---

## 📁 Project Structure

```
Esports/
├── index.html                  # Main tournament landing page
├── admin.html                  # Admin dashboard (auth-protected)
├── brackets.html               # Tournament bracket viewer
│
├── css/
│   ├── style.css               # Core styles — design tokens, layout, components
│   ├── animations.css          # Keyframe animations — glitch, fog, glow, shake
│   ├── admin.css               # Admin panel styles
│   └── brackets.css            # Bracket page styles
│
├── js/
│   ├── firebase-config.js      # Firebase initialization + default data seeding
│   ├── three-background.js     # Three.js WebGL particle system
│   ├── countdown.js            # Animated countdown timer component
│   ├── registration.js         # Multi-step form logic + validation
│   ├── main.js                 # Core app logic, UI interactions, audio system
│   ├── admin.js                # Admin dashboard logic
│   └── brackets.js             # Tournament bracket rendering
│
├── assets/
│   ├── images/                 # Favicon, logos, decorative assets
│   ├── sounds/                 # UI sound effects
│   └── videos/                 # Intro video files
│
├── firebase.json               # Firebase Hosting & Firestore configuration
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
├── DEPLOYMENT.md               # Deployment guide
└── FIXES.md                    # Bug fixes & changelog
```

---

## 🎮 Tournament Details

### 🥊 Tekken 7 — 1v1 Knockout

| Detail | Info |
|---|---|
| **Format** | Single Elimination |
| **Platform** | PC / Console |
| **Team Size** | 1v1 (Solo) |
| **Rules** | No mods/macros, controllers provided by organizers, no character change mid-match |
| **Disqualification** | Unsportsmanlike behavior, cheating, late arrival (>10 min) |

### 🎯 BGMI Arena — 4v4 TDM Knockout

| Detail | Info |
|---|---|
| **Format** | Classic Arena → Semis → Finals |
| **Platform** | Mobile |
| **Team Size** | 4v4 Squad |
| **Map** | TDM — Warehouse |
| **Allowed Weapons** | M416, AKM only |
| **Restrictions** | No sliding, no Level 3 vests, no sniper/heavy weapons from containers |
| **Disqualification** | Rule violations, cheating, glitch exploitation |

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- [Node.js](https://nodejs.org/) (v16+) — for Firebase CLI
- A [Firebase](https://firebase.google.com/) account

### 1. Clone the Repository

```bash
git clone https://github.com/Sidhant185/E-sports-Website-Bgmi.git
cd E-sports-Website-Bgmi
```

### 2. Firebase Setup

1. **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Firestore Database** — Start in test mode or apply the included security rules
3. **Enable Authentication** — Add Email/Password as a sign-in provider
4. **Update Firebase Config** — Replace the config in `js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3. Create Admin Users

1. Navigate to **Authentication → Users** in Firebase Console
2. Click **Add User** and enter an email/password
3. These credentials are used to log into the Admin Panel at `/admin.html`

### 4. Deploy Firestore Security Rules

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to your Firebase account
firebase login

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

### 5. Add Asset Files

Place the following files in their directories:

| Directory | Files | Description |
|---|---|---|
| `assets/images/` | `favicon.ico`, `logo.png` | Site favicon and event branding |
| `assets/sounds/` | `hover.mp3`, `click.mp3`, `success.mp3`, `error.mp3`, `next.mp3`, `prev.mp3`, `glitch.mp3` | UI interaction sounds |
| `assets/videos/` | `intro.mp4`, `intro.webm` | Optional intro video (3-5 seconds) |

### 6. Run Locally

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension → Right-click index.html → "Open with Live Server"
```

### 7. Deploy to Production

```bash
# Initialize Firebase Hosting (first time only)
firebase init hosting

# Deploy everything
firebase deploy
```

---

## 📄 Pages Walkthrough

### 🏠 Landing Page (`index.html`)

The main event page with the following sections:

1. **Hero Section** — Full-viewport hero with glitch-animated heading, CTA buttons, and volumetric fog overlay
2. **Games & Format** — Interactive flip-cards showcasing both tournaments with live registration counts
3. **Rules & Guidelines** — Expandable accordion panels with detailed rules for each game
4. **Registration Form** — 3-step wizard: Game Selection → Player/Team Details → Confirmation
5. **Event Details** — Animated countdown timer with event info cards (date, location, timing, organizer)
6. **Hype Section** — Motivational quote with atmospheric styling
7. **Footer** — Quick actions, event info, and credits

### 🏆 Brackets Page (`brackets.html`)

- Live single-elimination tournament bracket trees
- Game-specific bracket views (Tekken 7 / BGMI)
- Real-time updates when admin modifies brackets
- Winner highlighting and progression arrows

### 🔐 Admin Panel (`admin.html`)

- **Secure Login** — Firebase Authentication with email/password
- **Registration Overview** — View all Tekken & BGMI registrations with player details
- **Tournament Management** — Update match results, advance winners, manage brackets
- **Statistics Dashboard** — Registration counts, tournament status, event metrics
- **Real-time Sync** — All changes propagate instantly to the public pages

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|---|---|---|
| Void Black | `#0a0a0a` | Primary Background |
| Dark Purple | `#1a0a1f` | Secondary Background |
| Neon Purple | `#8b00ff` | Primary Accent |
| Halloween Orange | `#ff6600` | Secondary Accent |
| Blood Red | `#d90000` | Error / Danger |
| Toxic Green | `#00ff41` | Success States |
| Spectral Gold | `#d4af37` | Highlights |

### Typography

| Role | Font | Weights |
|---|---|---|
| Display / Headers | **Orbitron** | 400, 700, 900 |
| Body / UI | **Exo 2** | 300, 400, 600, 700 |
| System / UI | **Inter** | 300, 400, 500, 600, 700 |
| Code / Stats | **JetBrains Mono** / **Fira Code** | 300, 400, 500 |
| Horror Accent | **Creepster** | 400 |

### Visual Effects

| Effect | Implementation |
|---|---|
| **Glitch Text** | CSS `clip-path` transforms with pseudo-element overlays |
| **Neon Glow** | Multi-layered `box-shadow` with pulsing keyframe animations |
| **Fog Overlay** | CSS gradient `background-position` animation |
| **Card Flip** | 3D `rotateY` transform with backface-visibility |
| **Screen Shake** | CSS `translateX/Y` keyframe for feedback effects |
| **Typewriter** | JavaScript character-by-character text reveal |
| **3D Particles** | Three.js WebGL point system with custom shaders |
| **Parallax** | Scroll-linked `translateZ` transforms |

---

## 🔒 Security

### Firestore Rules Overview

| Collection | Public Read | Public Write | Auth Write |
|---|---|---|---|
| `tournament_settings` | ✅ | ❌ | ✅ |
| `tournament_brackets` | ✅ | ❌ | ✅ |
| `bgmi_teams` | ✅ | ✅ (registration) | ✅ |
| `tekken_players` | ✅ | ✅ (registration) | ✅ |
| `tournaments` | ✅ | ❌ | ✅ |
| `games` | ✅ | ❌ | ✅ |
| `registrations` | ❌ | ✅ (create only) | ✅ (full CRUD) |
| `admin` | ❌ | ❌ | ✅ |

> **Note:** Firebase client-side API keys are designed to be public and are restricted by security rules and domain whitelisting — not by key secrecy.

---

## 🌐 Browser Compatibility

| Browser | Status |
|---|---|
| Chrome / Edge 90+ | ✅ Full Support |
| Firefox 88+ | ✅ Full Support |
| Safari 14+ | ✅ Full Support (user gesture may be needed for audio) |
| Chrome Mobile | ✅ Optimized |
| Safari iOS | ✅ Optimized |

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| **Firebase not connecting** | Verify `firebase-config.js` has correct credentials and check network connectivity |
| **Three.js not rendering** | Ensure WebGL is supported in the browser; check console for CDN errors |
| **Countdown shows 000** | Verify `countdown.js` has the correct event date set |
| **Admin login fails** | Confirm user exists in Firebase Auth console; check email/password |
| **Registration fails** | Check Firestore rules allow public writes to registration collections |
| **Sounds not playing** | Browser autoplay policies may require a user gesture first |
| **Slow on mobile** | Three.js effects are auto-optimized for mobile; clear browser cache |

---

## 🔧 Customization Guide

### Change Event Date

In `js/countdown.js`, update the target date:

```javascript
this.eventDate = new Date('2025-10-31T18:00:00');
```

### Modify Color Scheme

In `css/style.css`, update the CSS custom properties:

```css
:root {
  --void-black: #0a0a0a;
  --neon-purple: #8b00ff;
  --halloween-orange: #ff6600;
  /* Add or modify colors here */
}
```

### Add New Tournaments

In `js/firebase-config.js`, add entries to `defaultTournaments`:

```javascript
{
  name: "Your Tournament Name",
  game: "game_id",
  date: new Date('2025-10-31T18:00:00'),
  status: "upcoming",
  format: "Your Format",
  prizePool: "Prize Amount",
  description: "Tournament description"
}
```

---

## 📦 Deployment

This project is configured for **Firebase Hosting** out of the box. See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide.

**Quick deploy:**

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

The `firebase.json` configuration serves all files from the project root with SPA-style rewrites to `index.html`.

---

## 🤝 Contributing

This project was built for a specific event at Vedam Campus. Contributions and forks for similar events are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software created for **Vedam Esports**. All rights reserved © 2025.

---

## 📞 Contact

| | |
|---|---|
| **Organizer** | Vedam Esports |
| **Powered By** | Code Nexus |
| **Event Date** | October 31, 2025 |
| **Location** | Vedam Campus |

---

<div align="center">

### 🎃 _"Knockout or be knocked out — this Halloween, there's no respawn."_ 👻

**Happy Halloween Gaming! 🎮⚔️🏆**

</div>

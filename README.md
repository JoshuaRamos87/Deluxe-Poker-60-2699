# Retro Poker 60-2699

A 1:1 functional web-based recreation of the classic **RadioShack 2-Player Poker** handheld game (Cat. No. 60-2699). This project simulates the physical user interface, the segmented LCD screen, and the specific "Jacks or Better" mathematical logic native to the original hardware.

## Features
- **Authentic Visuals:** Two-tone plastic casing, LCD grain texture, and high-fidelity 14-segment digital display (DSEG14).
- **Tactile UI:** Realistic hardware-style buttons with active-state shadows and offsets.
- **Classic Gameplay:** 5-card draw poker following the "Jacks or Better" variant.
- **Pass-and-Play:** Dedicated 2-player mode that tracks scores for both Player 1 and Player 2.
- **Immersive Sound:** Web Audio API synthesized piezo-buzzer beeps and win jingles.
- **Sequential Reveal:** Authentically animated card reveal logic (left-to-right) with synchronized beeps.
- **Point System:** Start with 100 points; lose 5 points for every non-winning round. "TOTAL GAME OVER" at 0 points.

## Technical Stack

### Backend
- **Node.js (LTS)** with **Fastify**
- **TypeScript** (Strict Mode)
- **Vitest** for authoritative hand-evaluation unit testing
- **In-memory Session Management** for secure, server-side game state

### Frontend
- **Angular (Latest)**
- **Angular Signals** for reactive, zero-latency UI updates
- **SCSS** for advanced hardware-mimicking styles
- **Web Audio API** for hardware-accurate sound synthesis

## Prerequisites
Before running this project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS recommended, v18+)
- [npm](https://www.npmjs.com/) (included with Node.js)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Deluxe-Poker-60-2699.git
cd Deluxe-Poker-60-2699
```

### 2. Run the Backend Server
The backend acts as the authoritative game engine.
```bash
cd backend
npm install
npm run start
```
*The server will run on `http://localhost:3000`.*

### 3. Run the Frontend Application
The frontend is the "hardware shell" that communicates with the server.
```bash
# Open a new terminal window/tab
cd frontend
npm install
npm start
```
*The application will be available at `http://localhost:4200`.*

## Rules & Paytable
For detailed information on hand rankings and point rewards, see the [Rules.md](./Rules.md) file.

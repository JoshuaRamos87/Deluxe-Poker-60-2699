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
- **Standalone Client:** No backend required. All logic runs locally in the browser for zero-latency gameplay.

## Technical Stack
- **Angular (Latest)** - Frontend framework using Standalone Components.
- **Angular Signals** - For reactive, zero-latency UI updates.
- **SCSS** - Advanced hardware-mimicking styles and animations.
- **Web Audio API** - Precise hardware-accurate sound synthesis.
- **Vitest** - Authoritative hand-evaluation unit testing.

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS recommended, v18+)
- [npm](https://www.npmjs.com/) (included with Node.js)

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run the Application
```bash
npm start
```
*The application will be available at `http://localhost:4200`.*

### 3. Run Logic Tests
To verify the poker hand evaluation logic:
```bash
npm run test:logic
```

### 4. Build Android APK
To generate a native Android debug APK:
```bash
npm run build:apk
```
*The resulting APK will be located in `android/app/build/outputs/apk/debug/app-debug.apk`.*

### 5. Update App Icons
If you modify `resources/icon.svg`, update the native Android icons by running:
```bash
npm run generate:assets
```
*(Note: Both Android commands require Android SDK and Java installed.)*

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Rules & Paytable
For detailed information on hand rankings, point rewards, and game mechanics, see the [Rules.md](./Rules.md) file.

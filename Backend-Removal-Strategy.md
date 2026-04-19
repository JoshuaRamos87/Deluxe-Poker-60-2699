# Backend Removal & Client-Side Migration Strategy

## Executive Summary
Migrating the game logic entirely to the Angular frontend will eliminate network latency, simplify the codebase, and make the application incredibly easy to host (e.g., as a purely static site on GitHub Pages or Vercel). The core poker algorithms (`logic.ts`) are completely standalone and can be moved without rewriting them.

## Scope of Work

To transition this project to a standalone frontend application, the following steps are required:

### 1. Relocate Core Logic
The core poker algorithms and type definitions do not need to be rewritten, just moved.
*   Move `backend/src/types.ts` to `frontend/src/app/models/game.models.ts` (merging with existing types).
*   Move `backend/src/logic.ts` (deck creation, shuffling, and hand evaluation) to a new utility file like `frontend/src/app/utils/poker-logic.ts`.
*   *Note:* The Vitest unit tests (`logic.spec.ts`) can also be moved to the frontend to ensure we maintain our authoritative hand evaluation tests.

### 2. Refactor State Management (`GameService`)
Currently, the Angular `GameService` acts as a "dumb" client, blindly accepting state from the server. This service needs to be upgraded to the "authoritative" game engine.
*   The `GameSession` interface will be managed purely within the frontend using Angular Signals.
*   The service will maintain the hidden `deck` array, the `currentPlayer`, and both players' scores locally in memory.

### 3. Eliminate HTTP Requests
All API calls in `GameService` will be replaced with direct, synchronous function calls.

**Current (Backend API) Approach:**
```typescript
async draw() {
  // Makes network request, waits for server to shuffle/evaluate
  const res = await firstValueFrom(this.http.post(`${this.apiUrl}/draw`, { heldIndices }));
  this.session.set(res);
}
```

**Proposed (Client-Side) Approach:**
```typescript
draw() {
  const s = this.session();
  const newHand = [...s.currentHand];
  
  // Replace unheld cards directly from the local deck array
  for (let i = 0; i < 5; i++) {
    if (!this.heldIndices()[i]) {
      newHand[i] = s.deck.pop()!;
    }
  }

  // Evaluate hand synchronously
  const { rank, points, winningIndices } = evaluateHand(newHand);
  
  // Update local score and session signals immediately
  this.updateScores(points);
  this.session.update(current => ({ ...current, currentHand: newHand, phase: 'gameover' }));
  
  // Trigger existing UI animations...
}
```

### 4. Remove Backend Infrastructure
*   Delete the entire `backend/` directory.
*   Remove Fastify, `cors`, and `ts-node` dependencies.
*   The project becomes a standard, single-directory Angular workspace.

### 5. Documentation & Configuration Updates
*   Update the frontend `package.json` name to something clean, like `retro-poker-60-2699`.
*   Update the `README.md` to remove instructions about starting the Node server, as running `npm start` (or `ng serve`) in the frontend directory will now be the only step required.

---

## Analysis: Pros & Cons

### Advantages of Client-Side Only
1.  **Zero Latency:** Card dealing and evaluation happen instantly in the browser's memory, ensuring the sound effects and visual animations sync flawlessly without any potential network jitter.
2.  **Trivial Deployment:** The compiled output is just static HTML/CSS/JS. It can be hosted for free anywhere without needing a Node.js server environment.
3.  **Simplified Development:** No need to manage concurrent terminal windows (one for API, one for UI), CORS policies, or API contracts.
4.  **Smaller Footprint:** Drastically reduces the repository size and dependency weight.

### Disadvantages (and Mitigations)
1.  **State Loss on Refresh:** If the user hits F5, the current game session is wiped.
    *   *Mitigation:* If desired, the `GameService` can easily be updated to sync the `session` Signal to the browser's `localStorage`, allowing games to survive page reloads.
2.  **Logic Visibility:** The source code for the paytable and evaluation is visible in the browser tools.
    *   *Mitigation:* None needed. The logic is based on a public, well-known 1980s toy. There is no competitive advantage or security risk in exposing it.

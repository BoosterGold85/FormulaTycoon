# Formula Tycoon Starter

This ZIP is the first visual prototype for Formula Tycoon: an Expo/React Native TypeScript app with a miniature isometric racing headquarters.

## What is already here

- Isometric factory floor rendered with standard React Native views
- Six department/work stations
- Six miniature workers
- Workers enter from the lower-right, walk to assigned stations, then remain in a working animation
- "Run Workday Again" button to replay the assignment animation
- Formula Tycoon mobile HUD/navigation shell
- Clean separation between `src/simulation` and `src/ui`
- Deterministic seeded RNG utility ready for future racing systems

## Run on Windows + iPhone

1. Install Node.js LTS if it is not installed.
2. Install **Expo Go** from the iPhone App Store.
3. Unzip this project.
4. Open PowerShell in this folder.
5. Run:

   ```powershell
   npm install
   npx expo start
   ```

6. Scan the QR code with the iPhone camera / Expo Go.

If the phone cannot see the development server over your local network, try:

```powershell
npx expo start --tunnel
```

## Why SDK 57?

As of October 2026, Expo is transitioning to SDK 58. Expo's current guidance says developers using Expo Go on a physical device should use SDK 57 during the transition. This starter therefore targets SDK 57 / React Native 0.86.

## Important

This is intentionally **not** the full game. It is the first playable/visual foundation. The next step should be generating the fictional 10-team/20-driver universe underneath this HQ, not adding more decoration.

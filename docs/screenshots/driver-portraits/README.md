# Reusable driver portrait review

Generated from the actual component/exported app, October 30, 2026. No generated mockups.

- [One template, three palettes at80/100/120px](three-palette-card-scales.png)
- [Player roster,390×844](drivers-roster-390x844.png)
- [Player dossier,390×844](driver-dossier-390x844.png)
- [Rival dossier,390×844](rival-dossier-390x844.png)
- [Dossier,1440×1000](driver-dossier-desktop.png)
- [Standalone component review HTML](palette-gallery.html)

Reproduce with an existing exported app served at localhost8783:

```sh
node scripts/check-driver-portraits.cjs
```

Override `FORMULA_PREVIEW_URL` or `FORMULA_ARTIFACT_DIR` if needed. The script uses already-installed
TypeScript/React Native Web/Playwright/Chromium. The palette sheet server-renders the same production
component through RN Web; it does not add an app demo route or simulation fixture. Widths are CSS
pixels. Screenshots are exact390×844 or1440×1000; the sheet is680×880. Identical teammates share art
by design; driver names distinguish them. Market thumbnails are deliberately subordinate48px.
Native rendering/accessibility/performance and live workers.dev runtime remain unverified.

No simulation, contract rules, portrait persistence, dependencies or save migration added.

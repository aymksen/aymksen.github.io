# Aymen Makhkhas — Portfolio

React 19 + TypeScript + Tailwind CSS v4, built with Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then outputs static files to dist/
```

`dist/` is a static site served from `/`. Pushing to `main` runs `.github/workflows/deploy.yml`,
which builds it and publishes `dist/` to the `gh-pages` branch that serves https://aymksen.github.io.

## Content

All text lives in `src/data/portfolio.ts`, and the résumé link points to `public/Resume.pdf`.

## Components

Ported from [21st.dev](https://21st.dev) into typed components under `src/components/ui/`:

| Component | Used for |
| --- | --- |
| `liquid-metal-hero` (@chowlol202) | Hero with the chrome metaball shader |
| `gradient-wave-text` (@tom_ui) | Colour wave through the name and the contact headline |
| `apple-hello-effect` (@ncdai) | Quick "hello" intro (~1.5 s), once per visit |
| `apple-tahoe-liquid-glass-button` (@jahed) | Every button |
| `apple-liquid-glass-switcher` (@dennysdionigi) | Light / dark theme switch |
| `liquid-weather-glass` (@uilayout.contact) | Glass cards in the About bento, incl. live Münster time and weather |
| `fluid-particles-background` (@bundui) | Contact section background |
| `globe` (@ruixen.ui) | Spinning globe in the About bento |

Changes from the originals are noted at the top of each file (mostly performance:
animation loops pause off-screen, the glass viewport can render with WebGL, and the
card turbulence filter is opt-in).

The About card fetches current weather from [Open-Meteo](https://open-meteo.com) in the
visitor's browser; everything else, including the Inter font, is self-hosted.

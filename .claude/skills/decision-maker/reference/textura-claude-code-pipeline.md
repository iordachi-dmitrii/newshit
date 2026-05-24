# TEXTURA / Claude Code Pipeline

**Premium Animated Websites — Website Pipeline, Claude Code Edition**

A step-by-step process for building premium animated websites with AI — from
finding a design reference to deploying on a host.

> Made by TEXTURA Agency. More pipelines and case studies → textura.agency

---

## Pipeline steps at a glance

| Step    | Phase       |
| ------- | ----------- |
| 01      | Brief       |
| 02–03   | Reference   |
| 04      | Build       |
| 05–07   | Style       |
| 08      | Assets      |
| 09      | Animations  |
| 10      | Optimize    |
| 11      | Deploy      |

---

## Antigravity vs Claude Code

| Antigravity                     | Claude Code                                  |
| ------------------------------- | -------------------------------------------- |
| Screenshot → AI builds in browser | Screenshot → Claude writes clean code      |
| Edit visually → export          | Iterate in plain English → full control      |
| Vendor lock-in                  | Standard Next.js / HTML output               |

---

## Phase 1 — Brief & Strategy

### 01 · Brief & Copywriting

Define the brand, audience and tone of voice. Generate all page copy with
Perplexity or Claude.ai — **before** touching any code or design.

**Tools:** Perplexity · Claude.ai

**Prompt:**
```
You are a senior copywriter. Write hero headline, subheadline, 3 feature
descriptions, CTA and footer copy for [BRAND]. Tone: [cinematic / bold / minimal].
Output JSON.
```

---

## Phase 2 — Reference

### 02 · Find a Section Reference

Browse Dribbble, Behance or Awwwards for strong hero sections.
Search tags: `landing page`, `hero`, `product`, `dark UI`.

**Tools:** Dribbble · Behance · Awwwards
(dribbble.com · behance.net · awwwards.com)

### 03 · Strip the Background

Use GPT Image 4o or OpenArt to strip all background graphics. Keep only
typography, buttons and nav on a solid black background. This becomes your
precise layout reference for Claude Code.

**Tools:** GPT Image 4o · OpenArt

**Prompt:**
```
A high-fidelity mockup based on [screenshot]. Only UI elements on solid black
background. All background imagery removed. Text and buttons in strict black
and white. Stark, minimal, high-contrast monochrome.
```

- **Before:** Original reference
- **After:** Clean B&W UI for Claude

---

## Phase 3 — Build in Claude Code

### 04 · Recreate the Layout from Screenshot

Open Claude Code. Attach the B&W screenshot and describe the task. Claude Code
reads the image and recreates the layout pixel-close. You get a working
template — customise it from there.

**Tools:** Claude Code · Next.js 16 · React Spring

**Prompt:**
```
You are a senior web designer and developer. Recreate the referenced layout
one-to-one using Next.js 16. Match fonts (use similar creative typefaces),
spacing, proportions and element positioning. Use React Spring to animate
elements sequentially on load.
```

**Pro tip:** Attach the cleaned reference and the original together — Claude
Code uses the clean version for layout and the original for mood, colour feel
and typographic intent.

---

## Phase 4 — Fonts & Color

### 05 · Typography

Pick trending display fonts on Google Fonts and the Awwwards Free Fonts
collection. Search for: `Condensed`, `Black`, `Extended`.

**Tools:** Google Fonts · Awwwards Fonts
(fonts.google.com · awwwards.com/free-fonts)

### 06 · Color Palettes

Find trending color combinations on Coolors → Trending Palettes. Export as CSS
variables and hand them directly to Claude Code.

**Tools:** Coolors (coolors.co/palettes/trending)

**Prompt:**
```
Take this palette [HEX list] and apply it to the project. Update all CSS custom
properties. Primary CTA button — [COLOR].
```

### 07 · 3D Models

Search free 3D models on Sketchfab. Download GLB / GLTF and embed via Three.js
or Spline — Claude Code will write the integration.

**Tools:** Sketchfab (sketchfab.com/feed)

---

## Phase 5 — Visual Assets

### 08 · Image & Video Generation

Generate hero illustrations, 3D characters and looping video backgrounds with
OpenArt. Kling 3.0 produces seamless loop videos — perfect as animated site
backgrounds.

**Tools:** OpenArt · Kling 3.0 (openart.ai)

**Prompt:**
```
3D render, [description], dark cinematic background, soft rim lighting, 4K,
transparent bg. Style: Clay / Glossy / Neon.
```

---

## Phase 6 — Animations

### 09 · Animations Referenced from Pinterest

Collect short animation clips on Pinterest — hover states, scroll reveals,
marquee, sticky sections. Drop the references into Claude Code and ask it to
implement them with GSAP or Framer Motion.

**Tools:** Pinterest · GSAP · Framer Motion (pinterest.com)

**Prompt:**
```
Implement these animation references with GSAP ScrollTrigger. Hero text:
staggered reveal on load. Cards: fade + lift on scroll into view. Marquee:
infinite horizontal loop, pause on hover. Respect prefers-reduced-motion.
```

---

## Phase 7 — Optimization

### 10 · Asset Compression

Compress all assets before deploying with Squoosh and Claude Code. Heavy files
kill load speed and conversion rates.

**Tools:** Squoosh · Claude Code

**Prompt:**
```
Audit /public: convert all images to WebP, add lazy loading. Video: MP4+WebM
under 2MB. Preload hero font. Reserve space for hero image to prevent layout
shift (CLS).
```

**Checklist:**
- PNG / JPG → WebP (Squoosh, quality 80%)
- Video loop → MP4 + WebM, max 2 MB
- Fonts: preload in `<head>`
- Images: lazy loading + explicit width / height attributes
- Animations: add `@media (prefers-reduced-motion)`
- Text contrast: minimum AA (4.5 : 1)

---

## Phase 8 — Deploy

### 11 · Host the Site

Static sites: drag the folder onto Vercel or Netlify. For Next.js — one command
in terminal. Connect a custom domain via DNS in under 5 minutes (e.g. with
Hostinger).

**Tools:** Vercel · Netlify · Hostinger

**Prompt:**
```
Generate vercel.json: cache /public/* immutable 1 year, redirect www → apex
domain, 404 → index.html for SPA routing.
```

**Checklist:**
- Static site: drag & drop folder onto vercel.com / netlify.com
- Next.js: `npm run build` → `vercel deploy`
- Domain: add an A-record or CNAME in your DNS settings
- HTTPS: provisioned automatically on Vercel / Netlify
- Run Lighthouse — target 90+ Performance score

---

## Resources — All Pipeline Links

**References**
- Dribbble — dribbble.com
- Behance — behance.net
- Awwwards — awwwards.com
- Pinterest (animations) — pinterest.com

**Fonts & Color**
- Google Fonts — fonts.google.com
- Awwwards Free Fonts — awwwards.com/free-fonts
- Coolors Trending — coolors.co/palettes/trending

**Assets**
- OpenArt (images + video) — openart.ai
- Sketchfab (3D models) — sketchfab.com/feed
- Kling 3.0 (video loops) — klingai.com

**Deploy**
- Vercel — vercel.com
- Netlify — netlify.com
- Hostinger — hostinger.com

# 🔍 Alibi — AI Forenzná Platforma

> **AI-Powered Forenzná Analýza Výpovedí, Detekcia Rozporov, Alibi Verifikácia a Vizualizácia Vzťahov.**  
> Postavené na **Nuxt 4**, **Vue 3**, **Nuxt UI 4**, **Pinia**, **Mistral AI (Mistral Large & Pixtral 12B Vision)** a **Base44 SDK**.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Production-blue?logo=vercel)](https://dashboard-4libi-chi.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-mistral--alii--dashboardblue-black?logo=github)](https://github.com/you640/mistral-alii-dashboardblue)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-v4.5.2-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![Pinia](https://img.shields.io/badge/State-Pinia_Store-FFE56B?logo=vue.js)](https://pinia.vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Živá Aplikácia (Production)
- **Oficiálna URL**: [https://dashboard-4libi-chi.vercel.app](https://dashboard-4libi-chi.vercel.app)
- **GitHub Repozitár**: [https://github.com/you640/mistral-alii-dashboardblue](https://github.com/you640/mistral-alii-dashboardblue)

---

## 🌟 Kľúčové Forenzné Funkcie

### 1. 📁 Hromadný Import Dokumentov & OCR Vision (Mistral / Pixtral)
- Podpora pre **PNG, JPG, WEBP, PDF a TXT** súbory.
- Drag & Drop rozhranie s interaktívnou frontou a percentuálnym sledovaním stavu analýzy.
- **Pixtral 12B Vision**: priame optické rozpoznávanie a extrakcia z fotografií zápisníc a scanov.
- **Mistral Large**: hĺbková sémantická analýza, extrakcia subjektov, predikátov, objektov, časov, lokalít a vozidiel.

### 2. ⚡ Automatická Krížová Kontrola Rozporov
- AI porovnáva každé nové atomické tvrdenie s existujúcimi tvrdeniami v databáze.
- Detekcia **časovo-priestorových konfliktov** (rovnaká osoba na dvoch rôznych miestach v rovnakom čase).
- Human-in-the-loop validácia: vyšetrovateľ môže rozpor **Potvrdiť (Confirmed)** alebo **Zamietnuť (Dismissed)**.

### 3. 🕸️ Interaktívny Graf Vzťahov & PageRank Centralita
- Vektorová SVG vizualizácia vzťahovej siete medzi podozrivými, svedkami a obetami.
- Sémantická klasifikácia väzieb: *Spolupáchateľ*, *Konflikt/Hádka*, *Finančný tok*, *Rodina*, *Alibi kontakt*.
- Automatický výpočet **PageRank skóre** pre odhalenie kľúčových hubov (hlavných organizátorov).

### 4. 🗺️ Geopriestorový Engine & Verifikácia Alibi
- GPS databáza slovenských miest a okresov.
- Haversine cestná kalkulácia s reálnym koeficientom cestnej siete.
- Detekcia fyzikálne nemožných presunov (napr. Bratislava ➔ Košice za 30 minút vyhodnotené ako kritický rozpor).

### 5. 🏛️ Súdny Dossier & Kryptografická Integrita (SHA-256)
- Generovanie **SHA-256 digitálneho odtlačku prípadu** a reťazca dôkazov (*Chain of Custody*).
- Export do Excel-friendly CSV tabuľky (oddeľovač `;` s UTF-8 BOM).
- Export vyšetrovacieho spisu do auditného JSON a PDF archívu.

---

## 🛠️ Architektúra & Technologický Stack

```
dashboard-4libi/
├── app/
│   ├── assets/css/main.css       # Forenzná tmavá farebná schéma & tokeny
│   ├── composables/
│   │   ├── useAiAnalyzer.ts      # AI extrakcia & krížová kontrola tvrdení
│   │   └── useBatchUploader.ts   # Fronta hromadného importu & progress
│   ├── layouts/default.vue       # Responzívny sidebar s forenznou navigáciou
│   ├── pages/
│   │   ├── index.vue             # Dashboard s live KPI metrikami
│   │   ├── documents.vue         # Spisy & Hromadný Drag & Drop import
│   │   ├── persons.vue           # Adresár osôb & detekcia kľúčových hubov
│   │   ├── contradictions.vue    # Správa a validácia rozporov
│   │   ├── graph.vue             # Interaktívny graf vzťahov
│   │   ├── timeline.vue          # Chronologická časová os
│   │   └── settings.vue          # API kľúče, Base44 & Export súdneho spisu
│   ├── stores/
│   │   └── forenzStore.ts        # Silne typovaný Pinia store s perzistenciou
│   └── types/index.d.ts          # Forenzné doménové typy
├── server/
│   └── api/forenz/analyze.post.ts # Nitro Serverless endpoint pre Mistral AI
├── public/
│   ├── icons/                    # PWA ikony (192x192, 512x512, apple-touch)
│   ├── manifest.json             # PWA Web App Manifest
│   └── sw.js                     # Offline Service Worker
├── tests/
│   ├── special/                  # 5 špeciálnych forenzných testovacích sád
│   │   ├── 01_cross_examination.test.js
│   │   ├── 02_court_dossier_pdf.test.js
│   │   ├── 03_crypto_integrity.test.js
│   │   ├── 04_graph_metrics.test.js
│   │   ├── 05_geospatial_alibi.test.js
│   │   └── run_all_special_tests.js
│   └── test_batch_analyze.js     # Integračný test dávkovej AI analýzy
├── nuxt.config.ts                # Nuxt 4 konfigurácia & Vercel Nitro preset
├── vercel.json                   # Vercel serverless limity (60s) & hlavičky
└── package.json
```

---

## 🚀 Spustenie a Vývoj Lokálne

### 1. Inštalácia závislostí:
```bash
npm install
```

### 2. Nastavenie premenných prostredia:
Vytvorte súbor `.env` (podľa `.env.example`):
```env
MISTRAL_API_KEY=your_mistral_api_key
BASE44_APP_ID=6a81f5e7f4adbf6a9523b9d8
```

### 3. Spustenie vývojového servera:
```bash
npm run dev
```
Aplikácia pobeží na `http://localhost:3000`.

---

## 🧪 Testovanie (Test Suites)

### Spustenie 5 špeciálnych forenzných testov:
```bash
node tests/special/run_all_special_tests.js
```

### Spustenie integračného testu dávkovej AI analýzy:
```bash
node tests/test_batch_analyze.js
```

---

## 🚢 Produkčný Build a Deploy na Vercel

```bash
# 1. Lokálny dry-run build
npm run build

# 2. Nasadenie na produkciu cez Vercel CLI
npx vercel --prod
```

---

## 📄 Licencia
Tento projekt je licencovaný pod [MIT Licenciou](LICENSE).

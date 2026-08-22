# CharakBloom — Personal PCOS Management App

A personal iOS app built after a PCOS diagnosis. It connects cycle tracking, phase-synced workouts, PCOS-friendly meal planning, and a daily Gemini AI plan — tuned to real-life constraints, not aspirational ones.

Try it on **[Live demo →](https://bloom-pcos.vercel.app/demo.html)**

---

## Why

Generic apps don't know you're in luteal phase and exhausted, or that you only have a stovetop, or that your cycle runs 32–44 days. CharakBloom connects all of it: current phase → what to eat from what's in the kitchen → what workout makes sense right now → why.

---

## How it works

**Cycle-first.** Everything flows from the current phase. PCOS-adjusted boundaries: menstrual 1–5, follicular 6–13, ovulatory 14–(cycleLength−14), luteal remainder. The phase drives workout intensity, meal focus, AI prompt context, and screen colour.

**Real constraints.** Meals and workouts are built around actual equipment and pantry items — For example, stovetop/microwave only, no oven; pilates mat, water bottles, two ~8lb gallon jugs, treadmill, stationary cycle; no gym.

**One AI call a day.** One rich Gemini call on first open — injects phase, cycle predictions, live grocery list, equipment, and cooking constraints — cached for the whole day. Falls back to static data silently on failure.

**Predictions from your data.** Cycle predictions use an exponential decay–weighted average of your last 6 cycles (±std dev confidence interval). Ovulation is predicted from your historically consistent luteal phase. Manual override always available.

**Pantry as AI context.** Toggling a grocery item in/out of stock directly changes what shows up in tomorrow's AI meal suggestions.

---

## Features

| Tab | What it does |
|---|---|
| **Home** | Daily greeting, AI insight, today's breakfast + featured workout, quick symptom log |
| **Cycle** | SVG cycle wheel, phase tips, auto-computed predictions with confidence range, cycle history, Flo data import; **Trends** screen with scrollable bar charts for cycle length, period length, and ovulation timing across full history |
| **Meals** | AI meal plan for today + static meals filtered by phase |
| **Move** | AI workout of the day + static workouts by phase, full step-by-step detail modal |
| **Pantry** | Grocery list by category; in-stock items feed the daily AI prompt |
| **Track** | Daily symptom logger (8 PCOS symptoms), 7-day history |

---

## Tech stack

| | |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router v4 (file-based) |
| AI | Gemini 2.5 Flash (REST, free tier) |
| Storage | AsyncStorage — all data local, no backend |
| Graphics | React Native SVG (cycle wheel + trend charts) |
| Dates | date-fns v4 |

---

## Setup

Requires Node.js 20+ and Expo Go (SDK 54) on iPhone.

```bash
npm install --legacy-peer-deps
```

Create `.env`:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Free key at [aistudio.google.com](https://aistudio.google.com) — 20 requests/day, the app uses one. Works fully without a key (static data fallback).

```bash
npx expo start
npx expo start --tunnel  # restricted WiFi
```

---

## Importing cycle data

On the Cycle tab → **+ Import data**. Three formats are supported:

**Flo JSON export** (`flo.json`) — upload directly from your Files app. The app reads `operationalData.cycles` and extracts ovulation dates from Eggwhite fluid events or ML predictions.

**Flo text export** (`res.txt`) — upload the plain-text export from Flo. Cycle blocks and manual events are parsed automatically.

**Simplified JSON** — paste manually in this format:

```json
{
  "cycles": [
    {
      "start_date": "2026-01-01",
      "end_date": "2026-02-04",
      "cycle_length": 35,
      "period_length": 5,
      "ovulation": "2026-01-20"
    }
  ]
}
```

`ovulation` is optional in all formats. Importing replaces the current cycle history and immediately recalculates predictions.

---

## Future plans

- Symptom charts across the cycle (how PCOS symptoms correlate with phase)
- Meal ingredient → Pantry shortcut (tap an ingredient to add it)
- More robust prediction model

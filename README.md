# dungeon-seed-viz

A design preview tool for procedural dungeon generators. You type a seed string and get back a room layout graph so you can actually see what your seed produces before you wire it into anything.

Most generators just run and spit out a result. The missing piece is a way to look at the *structure* of a seed: how many rooms, how they connect, where the loops are, how deep the boss room sits. That is what this does.

**[Live demo](https://abdullahasaadghalihamza.github.io/Dungeon-Room-Seed-Visualizer)**

---

## Features

- Any string hashes into a deterministic room graph. Same seed, same layout every time.
- Room types: start, boss, treasure, puzzle, trap, shop, rest, standard. Weights are configurable.
- Edge types: normal corridors, secret doors (dashed), locked doors, one-way passages.
- Hover any room to see its name, type, depth, and connection count.
- Export as JSON, CSV, DOT (Graphviz), or PNG.
- Shareable URLs. Seed and config encode into query params.
- Compare two seeds side by side.
- Room type editor built into the UI. Change labels, colors, weights, and flavor names live.
- Config panel for room count range and door type probabilities.

---

## Setup

```bash
git clone https://github.com/yourusername/dungeon-seed-viz
cd dungeon-seed-viz
npm install
npm run dev
```

Open `http://localhost:5173`.

```bash
npm run build
```

Output goes to `dist/`. Fully static, no server needed.

---

## Deploy to GitHub Pages

There is a workflow at `.github/workflows/deploy.yml` that handles this automatically.

1. Go to your repo Settings, then Pages
2. Set source to GitHub Actions
3. Push to `main` and it deploys

The URL will be `https://yourusername.github.io/dungeon-seed-viz`.

---

## How the seed engine works

Seeds go through FNV-1a hashing to get a 32-bit integer. That integer seeds a linear congruential generator (LCG). Every placement decision, room type pick, and edge property pulls from that single RNG stream, so the output is fully deterministic.

```
seed string -> FNV-1a hash -> 32-bit int -> LCG -> all generation decisions
```

The relevant files are `src/engine/rng.ts` and `src/engine/generator.ts`. Both are plain TypeScript with zero dependencies. You can copy them into your own project and use them standalone.

---

## Project structure

```
src/
  engine/
    rng.ts           FNV-1a hash + LCG
    generator.ts     room placement, edge generation, depth computation
    renderer.ts      canvas drawing
    defaults.ts      room type configs and weights
  hooks/
    useDungeon.ts    generation state
    useCanvas.ts     render loop and hover detection
    useTheme.ts      light/dark toggle
  utils/
    export.ts        JSON, CSV, DOT, PNG
    urlState.ts      encode/decode URL params
  components/
    DungeonCanvas    canvas wrapper
    SeedInput        input with history dropdown
    StatsBar         counts and hover info
    Legend           room and edge type legend
    ExportMenu       download dropdown
    RoomTypeEditor   custom type editor
    ConfigPanel      generation parameter sliders
    CompareView      side-by-side comparison
    ShareButton      copy shareable URL
  types/index.ts
  App.tsx
  main.tsx
```

---

## Customizing room types

Edit `src/engine/defaults.ts` to change the defaults. Each type looks like this:

```typescript
{
  type: 'treasure',
  label: 'Treasure',
  color: '#3A6B48',
  darkColor: '#4A7C59',
  textColor: '#ffffff',
  darkTextColor: '#d5ead9',
  weight: 12,
  description: 'Reward rooms.',
  icon: '◈',
  flavors: ['Vault', 'Armory', 'Hoard'],
}
```

`start` and `boss` have weight 0 because the generator places them procedurally, not by weighted pick.

---

## Export formats

| Format | Notes |
|--------|-------|
| JSON   | Full `DungeonGraph` object, matches the types in `src/types/index.ts` |
| CSV    | Rooms sheet and edges sheet in one file |
| DOT    | Graphviz format, render with `dot -Tpng graph.dot -o graph.png` |
| PNG    | Canvas snapshot at the current rendered size |

---

## Using the engine standalone

Copy `src/engine/rng.ts`, `src/engine/generator.ts`, `src/engine/defaults.ts`, and `src/types/index.ts` into your project.

```typescript
import { generate } from './engine/generator'

const graph = generate('my_dungeon_seed_01')

console.log(graph.rooms)
console.log(graph.edges)
console.log(graph.maxDepth)
```

Pass a config object as the second argument to override defaults:

```typescript
const graph = generate('my_seed', {
  minRooms: 8,
  maxRooms: 16,
  secretDoorChance: 0.2,
})
```

---

## URL params

The share button copies a URL like:

```
?seed=iron_keep_v2&min=6&max=14&secret=0.12
```

Compare mode:

```
?mode=compare&a=seed_one&b=seed_two
```

---

## Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Canvas API (no WebGL, no rendering library)

No backend, no database.

---

## Contributing

PRs welcome. A few things to keep in mind:

- Keep `rng.ts` and `generator.ts` dependency-free
- New room type defaults go in `defaults.ts`
- The renderer stays low-level canvas on purpose
- Run `npm run typecheck` and `npm run lint` before opening a PR

---

## License

MIT

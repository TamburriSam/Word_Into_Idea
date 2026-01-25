import "server-only";

import { getAssocByCue, getRandomAssocByLetter, type AssocRow } from "./db";

function normalizeToken(raw: string): string {
  // Your autofill uses "apple-123", this pulls "apple"
  const m = raw.toLowerCase().match(/[a-z0-9]+/i);
  return (m?.[0] ?? "").toLowerCase();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function weightedPick<T>(items: Array<{ item: T; w: number }>): T | null {
  const total = items.reduce((sum, x) => sum + x.w, 0);
  if (total <= 0) return null;

  let r = Math.random() * total;
  for (const x of items) {
    r -= x.w;
    if (r <= 0) return x.item;
  }
  return items[items.length - 1]?.item ?? null;
}

function addCandidate(
  bag: Map<string, number>,
  candidate: string,
  weight: number,
) {
  const c = candidate.trim().toLowerCase();
  if (!c) return;
  bag.set(c, (bag.get(c) ?? 0) + weight);
}

function pickAssocWord(row: AssocRow): string {
  // randomize between assoc1/assoc2 so it feels less robotic
  return Math.random() < 0.5 ? row.assoc1 : row.assoc2;
}

function chooseForCue(params: {
  cueRaw: string;
  used: Set<string>;
  favoriteLetter: string;
  pTwoHop: number;
}): string {
  const cue = normalizeToken(params.cueRaw);
  const used = params.used;

  if (!cue) return "blank";

  const row = getAssocByCue(cue);

  // Candidate bag: candidate -> weight
  const candidates = new Map<string, number>();

  if (row) {
    // 1-hop candidates (strongest)
    addCandidate(candidates, row.assoc1, 1.0);
    addCandidate(candidates, row.assoc2, 1.0);

    // Sometimes add 2-hop candidates
    if (Math.random() < params.pTwoHop) {
      const hop1 = [row.assoc1, row.assoc2].map((w) => normalizeToken(w));

      for (const h of hop1) {
        if (!h) continue;
        const r2 = getAssocByCue(h);
        if (!r2) continue;
        addCandidate(candidates, r2.assoc1, 0.65);
        addCandidate(candidates, r2.assoc2, 0.65);
      }
    }
  }

  // If we still have nothing, fallback by starting letter
  if (candidates.size === 0) {
    const firstLetter = cue[0] ?? "a";
    const randRow = getRandomAssocByLetter(firstLetter);
    if (randRow) {
      const fallback = pickAssocWord(randRow);
      const f = normalizeToken(fallback) || fallback.toLowerCase();
      return used.has(f) ? randRow.assoc1 || randRow.assoc2 : fallback;
    }
    return "idk";
  }

  const cueFirst = cue[0] ?? "";
  const fav = (params.favoriteLetter ?? "").toLowerCase();

  // Convert to weighted list with “human-ish” tweaks
  const weighted = Array.from(candidates.entries()).map(([word, base]) => {
    let w = base;

    const w0 = normalizeToken(word);
    const first = w0[0] ?? "";

    // tiny brain biases
    if (first && first === cueFirst) w += 0.08; // alliteration-ish
    if (fav && first && first === fav) w += 0.12; // favorite letter personality

    // faster brain prefers shorter words (small effect)
    const len = w0.length;
    if (len > 8) w -= clamp((len - 8) * 0.01, 0, 0.12);

    // repeats: nuke them
    if (used.has(w0)) w *= 0.05;

    // keep it sane
    w = clamp(w, 0.001, 10);

    return { item: word, w };
  });

  const pick = weightedPick(weighted);
  if (!pick) return "idk";

  return pick;
}

export function generateResponsesFromLwow(opts: {
  cues: string[];
  used: string[];
  favoriteLetter: string;
  pTwoHop?: number;
}): string[] {
  const usedSet = new Set(opts.used.map((w) => normalizeToken(w)));

  const pTwoHop = opts.pTwoHop ?? 0.28;
  const favoriteLetter = (opts.favoriteLetter ?? "").trim();

  const out: string[] = [];
  for (const cue of opts.cues) {
    const chosen = chooseForCue({
      cueRaw: cue,
      used: usedSet,
      favoriteLetter,
      pTwoHop,
    });

    out.push(chosen);
    usedSet.add(normalizeToken(chosen));
  }

  // Guarantee 26 (your UI assumes 26)
  while (out.length < 26) out.push("idk");
  return out.slice(0, 26);
}

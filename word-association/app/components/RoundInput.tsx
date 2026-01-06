"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

function SubmitButton({ round }: { round: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Thinking..." : `Submit Round ${round}`}
    </button>
  );
}

export default function RoundInput({ round, contextWords, formAction }: any) {
  // Store the randomized alphabet in state
  const [labels, setLabels] = useState<string[]>([]);

  // Randomize on mount (Client-side only) to avoid Hydration Errors
  useEffect(() => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    // Fisher-Yates Shuffle
    for (let i = alphabet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
    }
    setLabels(alphabet);
  }, []); // Empty dependency array = runs once on mount

  // === TEST ONLY: AUTOFILL FUNCTION ===
  const handleAutofill = () => {
    const testWords = [
      "apple",
      "brave",
      "crane",
      "drive",
      "eagle",
      "flame",
      "grape",
      "house",
      "image",
      "joker",
      "kite",
      "lemon",
      "mango",
      "noble",
      "ocean",
      "piano",
      "quiet",
      "river",
      "snake",
      "table",
      "uncle",
      "video",
      "water",
      "xenon",
      "yacht",
      "zebra",
    ];

    testWords.forEach((word, i) => {
      const input = document.getElementById(`word-${i}`) as HTMLInputElement;
      if (input) {
        input.value = `${word}-${Math.floor(Math.random() * 1000)}`;
      }
    });
  };
  // ====================================

  return (
    <form action={formAction}>
      {contextWords.length > 0 && <h3>Respond to the student's words:</h3>}

      <ol>
        {Array.from({ length: 26 }).map((_, i) => (
          <li key={`r${round}-${i}`}>
            <label htmlFor={`word-${i}`}>
              {/* LOGIC:
                  1. If Context Words exist (Round 2, 3, 4) -> Show AI Word
                  2. If Round 1 AND labels are loaded -> Show Randomized Letter
                  3. Fallback (Server-side render) -> Show "Word X"
              */}
              {contextWords[i] ? (
                <strong>{contextWords[i]}: </strong>
              ) : labels.length > 0 ? (
                <strong>{labels[i]}: </strong>
              ) : (
                `Word ${i + 1}: `
              )}
            </label>
            <input
              type="text"
              id={`word-${i}`}
              name={`word-${i}`}
              required
              autoComplete="off"
              placeholder="..."
            />
          </li>
        ))}
      </ol>

      <br />

      <div style={{ display: "flex", gap: "10px" }}>
        <SubmitButton round={round} />

        <button type="button" onClick={handleAutofill}>
          [TEST] Autofill
        </button>
      </div>
    </form>
  );
}

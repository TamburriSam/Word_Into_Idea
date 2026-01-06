"use server";

import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { Resend } from "resend";

// === Types ===
export type RoundData = {
  roundNumber: number;
  userWords: string[];
  aiWords: string[];
};

export type GameState = {
  round: number;
  favoriteLetter?: string; // <--- NEW FIELD
  history: RoundData[];
  lastAiWords: string[];
  error?: string;
  isFinished: boolean;
};

// === Game Logic Action ===
export async function submitExam(
  prevState: GameState,
  formData: FormData
): Promise<GameState> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return { ...prevState, error: "Server Error: API Key missing." };

  // === NEW: ROUND 0 LOGIC (Favorite Letter) ===
  if (prevState.round === 0) {
    const letter = formData.get("letter");

    if (!letter || typeof letter !== "string" || letter.trim().length === 0) {
      return { ...prevState, error: "Please enter a letter." };
    }

    return {
      round: 1,
      favoriteLetter: letter.trim().toUpperCase(),
      history: [],
      lastAiWords: [],
      error: undefined,
      isFinished: false,
    };
  }

  // === EXISTING LOGIC (Rounds 1-4) ===

  // 1. Extract Words
  const userWords: string[] = [];
  for (let i = 0; i < 26; i++) {
    const word = formData.get(`word-${i}`);
    if (typeof word === "string" && word.trim().length > 0) {
      userWords.push(word.trim());
    }
  }

  if (userWords.length !== 26) {
    return { ...prevState, error: "Please fill out all 26 words." };
  }

  // 2. Check for End of Game (Round 4)
  if (prevState.round === 4) {
    return {
      ...prevState, // Keep favoriteLetter
      round: 5,
      history: [
        ...prevState.history,
        {
          roundNumber: 4,
          userWords: userWords,
          aiWords: [],
        },
      ],
      lastAiWords: [],
      error: undefined,
      isFinished: true,
    };
  }

  // 3. AI Constraints (No Repeats)
  const pastAiWords = prevState.history.flatMap((h) => h.aiWords);

  // 4. Run AI
  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash", { apiKey }),
      schema: z.object({ responses: z.array(z.string()).length(26) }),
      system: `
        Round: ${prevState.round} of 4.
        Task: Respond to the user's 26 words with single-word associations.
        Persona: Tired student.
        CRITICAL: Do NOT use these words: [${pastAiWords.join(", ")}]
      `,
      prompt: `Input words: ${userWords.join(", ")}`,
    });

    return {
      ...prevState, // Keep favoriteLetter
      round: prevState.round + 1,
      history: [
        ...prevState.history,
        {
          roundNumber: prevState.round,
          userWords: userWords,
          aiWords: object.responses,
        },
      ],
      lastAiWords: object.responses,
      error: undefined,
      isFinished: false,
    };
  } catch (e) {
    console.error(e);
    return { ...prevState, error: "AI Error. Please try submitting again." };
  }
}

// === Feedback Action (TEST MODE) ===
export async function sendFeedback(formData: FormData) {
  const feedback = formData.get("feedback");

  console.log("------------------------------------------------");
  console.log("📝 FEEDBACK RECEIVED (Test Mode):");
  console.log(feedback);
  console.log("------------------------------------------------");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true };
}

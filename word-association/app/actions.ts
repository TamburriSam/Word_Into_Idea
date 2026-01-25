"use server";

import { generateResponsesFromLwow } from "@/server/lwow/engine";
import { LetterSchema, WordsSchema } from "@/server/lwow/validation";

// === Types ===
export type RoundData = {
  roundNumber: number;
  userWords: string[];
  aiWords: string[];
};

export type GameState = {
  round: number;
  favoriteLetter?: string;
  history: RoundData[];
  lastAiWords: string[];
  error?: string;
  isFinished: boolean;
};

// === Game Logic Action ===
export async function submitExam(
  prevState: GameState,
  formData: FormData,
): Promise<GameState> {
  // === ROUND 0 LOGIC (Favorite Letter) ===
  if (prevState.round === 0) {
    const letterRaw = formData.get("letter");
    const parsedLetter = LetterSchema.safeParse(
      typeof letterRaw === "string" ? letterRaw : "",
    );

    if (!parsedLetter.success) {
      return { ...prevState, error: "Please enter a letter." };
    }

    return {
      round: 1,
      favoriteLetter: parsedLetter.data.toUpperCase(),
      history: [],
      lastAiWords: [],
      error: undefined,
      isFinished: false,
    };
  }

  // 1) Extract 26 words
  const rawWords = Array.from({ length: 26 }, (_, i) =>
    formData.get(`word-${i}`),
  );
  const parsedWords = WordsSchema.safeParse(
    rawWords.map((w) => (typeof w === "string" ? w : "")),
  );
  if (!parsedWords.success) {
    return { ...prevState, error: "Please fill out all 26 words." };
  }
  const userWords = parsedWords.data;

  // 2) End of game after Round 4 submission (no AI run on round 4)
  if (prevState.round === 4) {
    return {
      ...prevState,
      round: 5,
      history: [
        ...prevState.history,
        { roundNumber: 4, userWords, aiWords: [] },
      ],
      lastAiWords: [],
      error: undefined,
      isFinished: true,
    };
  }

  // 3) Past AI words (avoid repeats)
  const pastAiWords = prevState.history.flatMap((h) => h.aiWords);

  // 4) Generate AI words locally (LWOW)
  try {
    const aiWords = generateResponsesFromLwow({
      cues: userWords,
      used: pastAiWords,
      favoriteLetter: prevState.favoriteLetter ?? "",
      // Strategy mix: feels human without overthinking it
      // Most of the time: direct assoc, sometimes: 2-hop
      pTwoHop: 0.28,
    });

    return {
      ...prevState,
      round: prevState.round + 1,
      history: [
        ...prevState.history,
        {
          roundNumber: prevState.round,
          userWords,
          aiWords,
        },
      ],
      lastAiWords: aiWords,
      error: undefined,
      isFinished: false,
    };
  } catch (e) {
    console.error(e);
    return {
      ...prevState,
      error:
        "LWOW Error. Make sure data/lwow/lwow.sqlite exists and has an associations table.",
    };
  }
}

// === Feedback Action (TEST MODE) ===
export async function sendFeedback(formData: FormData) {
  const feedback = formData.get("feedback");

  console.log("------------------------------------------------");
  console.log("📝 FEEDBACK RECEIVED (Test Mode):");
  console.log(feedback);
  console.log("------------------------------------------------");

  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true };
}

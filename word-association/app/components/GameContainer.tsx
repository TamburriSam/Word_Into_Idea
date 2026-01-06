"use client";

import { useActionState } from "react";
import { submitExam, GameState } from "@/app/actions";
import RoundZero from "./RoundZero";
import RoundInput from "./RoundInput";
import FinalGrid from "./FinalGrid";

const initialState: GameState = {
  round: 0, // <--- START AT ROUND 0
  history: [],
  lastAiWords: [],
  error: "",
  isFinished: false,
  favoriteLetter: "",
};

export default function GameContainer() {
  const [state, formAction] = useActionState(submitExam, initialState);

  // === VIEW 1: GAME OVER ===
  if (state.isFinished) {
    return <FinalGrid history={state.history} />;
  }

  // === VIEW 2: ROUND ZERO (Intro) ===
  if (state.round === 0) {
    return (
      <div>
        <h1>Word Association Exam</h1>
        {state.error && (
          <div
            style={{ color: "red", border: "1px solid red", padding: "10px" }}
          >
            {state.error}
          </div>
        )}
        <RoundZero formAction={formAction} />
      </div>
    );
  }

  // === VIEW 3: ACTIVE GAME (Rounds 1-4) ===
  return (
    <div>
      <h1>Round {state.round} / 4</h1>

      {state.error && (
        <div
          style={{
            color: "red",
            border: "1px solid red",
            padding: "10px",
            margin: "10px 0",
          }}
        >
          {state.error}
        </div>
      )}

      <RoundInput
        round={state.round}
        contextWords={state.lastAiWords}
        formAction={formAction}
      />
    </div>
  );
}

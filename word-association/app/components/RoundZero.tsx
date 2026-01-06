"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "..." : "Begin Exam"}
    </button>
  );
}

export default function RoundZero({
  formAction,
}: {
  formAction: (payload: FormData) => void;
}) {
  return (
    <div>
      <h2>Welcome</h2>
      <p>Before we begin, please answer the following:</p>

      <form action={formAction}>
        <label htmlFor="letter">
          <strong>What is your favorite letter?</strong>
        </label>
        <br />
        <br />

        <input
          type="text"
          id="letter"
          name="letter"
          maxLength={1}
          required
          placeholder="A"
        />

        <br />
        <br />
        <SubmitButton />
      </form>
    </div>
  );
}

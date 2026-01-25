"use client";

import { useRef, useState } from "react";
import { sendFeedback } from "@/app/actions";

export default function FeedbackModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Send Feedback
      </button>

      <dialog ref={dialogRef}>
        {status === "sent" ? (
          <div>
            <h3>Feedback Sent</h3>
            <p>Thank you for your input.</p>
            <form method="dialog">
              <button onClick={() => setStatus("idle")}>Close</button>
            </form>
          </div>
        ) : (
          <form
            action={async (formData) => {
              setStatus("sending");
              await sendFeedback(formData);
              setStatus("sent");
              // Auto-close after 2s
              setTimeout(() => {
                dialogRef.current?.close();
                setStatus("idle");
              }, 2000);
            }}
          >
            <h3>Submit Feedback</h3>
            <p>Let us know if you found any issues.</p>

            <textarea
              name="feedback"
              required
              placeholder="Type your feedback..."
              rows={5}
              cols={40}
            />

            <br />
            <br />

            <div>
              <button
                type="button"
                onClick={() => {
                  dialogRef.current?.close();
                  setStatus("idle");
                }}
              >
                Cancel
              </button>
              &nbsp;
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send Email"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}

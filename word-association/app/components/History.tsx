import { RoundData } from "@/app/actions";

export default function History({ history }: { history: RoundData[] }) {
  if (history.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem", borderTop: "1px solid #eee" }}>
      {history.map((h, i) => (
        <div
          key={i}
          style={{ padding: "1rem 0", borderBottom: "1px solid #eee" }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>
            Completed Round {h.roundNumber}
          </h3>
          <div style={{ fontSize: "0.9rem", color: "#888" }}>
            <strong>You:</strong> {h.userWords.slice(0, 5).join(", ")}... <br />
            <strong>AI:</strong> {h.aiWords.slice(0, 5).join(", ")}...
          </div>
        </div>
      ))}
    </div>
  );
}

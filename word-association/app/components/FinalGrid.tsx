"use client";

import { useState } from "react";
import { RoundData } from "@/app/actions";
import FeedbackModal from "./FeedbackModal";

export default function FinalGrid({ history }: { history: RoundData[] }) {
  // State for the checkboxes and the writing text area
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());
  const [prose, setProse] = useState("");

  // 1. Toggle Row Logic
  // Adds or removes a row index from the checked set
  const toggleRow = (index: number) => {
    const next = new Set(checkedRows);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedRows(next);
  };

  // 2. Real-time Strikethrough Logic
  // Creates a set of all words currently in the prose box (case-insensitive)
  const writtenWords = new Set(
    prose
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((w) => w.length > 0)
  );

  // Helper to check if a specific word should be crossed out
  const isWordUsed = (w: string) => writtenWords.has(w.toLowerCase());

  // 3. Print Logic: Lists Only
  const handlePrintLists = () => {
    const win = window.open("", "_blank", "noopener");
    if (win) {
      win.opener = null;
      const doc = win.document;
      doc.open();
      doc.write(
        "<!DOCTYPE html><html><head><title>Word Lists</title></head><body></body></html>",
      );
      doc.close();

      const h1 = doc.createElement("h1");
      h1.textContent = "Word Lists";
      doc.body.appendChild(h1);

      const table = doc.createElement("table");
      table.setAttribute("border", "1");
      table.cellPadding = "10";
      table.cellSpacing = "0";
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";

      const thead = doc.createElement("thead");
      const headRow = doc.createElement("tr");
      history.forEach((h) => {
        const th = doc.createElement("th");
        th.textContent = `List ${h.roundNumber}`;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = doc.createElement("tbody");
      for (let i = 0; i < 26; i++) {
        const tr = doc.createElement("tr");
        history.forEach((r) => {
          const td = doc.createElement("td");
          td.textContent = r.userWords[i] ?? "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      doc.body.appendChild(table);

      setTimeout(() => win.print(), 0);
    }
  };

  // 4. Print Logic: Prose Only
  const handlePrintProse = () => {
    const win = window.open("", "_blank", "noopener");
    if (win) {
      win.opener = null;
      const doc = win.document;
      doc.open();
      doc.write(
        "<!DOCTYPE html><html><head><title>Student Prose</title></head><body></body></html>",
      );
      doc.close();

      const h1 = doc.createElement("h1");
      h1.textContent = "Student Prose";
      doc.body.appendChild(h1);

      const hr = doc.createElement("hr");
      doc.body.appendChild(hr);

      const pre = doc.createElement("pre");
      pre.style.whiteSpace = "pre-wrap";
      pre.style.fontFamily = "serif";
      pre.style.fontSize = "14pt";
      pre.textContent = prose;
      doc.body.appendChild(pre);

      setTimeout(() => win.print(), 0);
    }
  };

  return (
    <div>
      <h2>Final Results</h2>

      {/* === THE GRID === */}
      {/* Uses standard HTML border attributes for barebones styling */}
      <table
        border={1}
        cellPadding={8}
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Select</th>
            {history.map((h) => (
              <th key={h.roundNumber}>List {h.roundNumber}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 26 }).map((_, i) => (
            <tr key={i}>
              <td style={{ textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={checkedRows.has(i)}
                  onChange={() => toggleRow(i)}
                />
              </td>
              {history.map((round, col) => (
                <td key={col}>
                  {/* If row is checked, use <del> tag for semantic strikethrough */}
                  {checkedRows.has(i) ? (
                    <del>{round.userWords[i]}</del>
                  ) : (
                    round.userWords[i]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* === WORDS TO USE SECTION === */}
      <div>
        <h3>Words to use:</h3>
        {checkedRows.size === 0 ? (
          <p>Please check rows in the table above to populate this list.</p>
        ) : (
          <ul>
            {/* Sort indices so they appear in order (Row 1, Row 2, etc.) */}
            {Array.from(checkedRows)
              .sort((a, b) => a - b)
              .map((idx) => (
                <li key={idx}>
                  <strong>Row {idx + 1}:</strong> &nbsp;
                  {history.map((round, i) => {
                    const w = round.userWords[idx];
                    return (
                      <span key={i}>
                        {/* Check if the student has typed this word in the box below */}
                        {isWordUsed(w) ? <del>{w}</del> : w}{" "}
                      </span>
                    );
                  })}
                </li>
              ))}
          </ul>
        )}
      </div>

      <hr />

      {/* === PROSE WRITING AREA === */}
      <div>
        <label htmlFor="prose">
          <strong>Write your prose here:</strong>
        </label>
        <br />
        <textarea
          id="prose"
          rows={15}
          style={{ width: "100%", fontSize: "1.1rem", marginTop: "10px" }}
          placeholder="Start writing... (Words from the list above will cross off as you type)"
          value={prose}
          onChange={(e) => setProse(e.target.value)}
        />
      </div>

      <br />

      {/* === ACTION BUTTONS === */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={handlePrintLists}>Download Lists</button>

        <button onClick={handlePrintProse}>Download Prose</button>

        <FeedbackModal />

        <button onClick={() => window.location.reload()}>Start Over</button>
      </div>
    </div>
  );
}

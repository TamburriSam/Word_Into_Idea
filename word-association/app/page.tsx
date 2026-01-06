import GameContainer from "./components/GameContainer";

export default function Page() {
  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <GameContainer />
    </main>
  );
}

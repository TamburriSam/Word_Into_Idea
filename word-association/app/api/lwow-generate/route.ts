import { NextResponse } from "next/server";
import { generateResponsesFromLwow } from "@/server/lwow/engine";
import { GenerateBodySchema } from "@/server/lwow/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = GenerateBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid body.",
        issues: parsed.error.issues.map(({ path, message }) => ({
          path,
          message,
        })),
      },
      { status: 400 },
    );
  }

  const { words, used, favoriteLetter, pTwoHop } = parsed.data;

  try {
    const aiWords = generateResponsesFromLwow({
      cues: words,
      used,
      favoriteLetter,
      pTwoHop,
    });

    return NextResponse.json({ ok: true, aiWords });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Failed to generate. Verify data/lwow/lwow.sqlite exists and server/lwow/engine.ts + db.ts are in place.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST with { words: [...] }" },
    { status: 405 },
  );
}

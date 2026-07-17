import { auth0 } from "@/lib/auth0";
import { insertCard, listCards } from "@/lib/cards-db";
import type { CardInput } from "@/lib/types";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cards = await listCards(session.user.sub);
    return Response.json(cards);
  } catch (error) {
    console.error("Failed to list cards:", error);
    return Response.json(
      { error: "Failed to load collection." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: CardInput;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!input.playerName) {
    return Response.json({ error: "playerName is required." }, { status: 400 });
  }

  try {
    const card = await insertCard(session.user.sub, input);
    return Response.json(card, { status: 201 });
  } catch (error) {
    console.error("Failed to create card:", error);
    return Response.json({ error: "Failed to save card." }, { status: 500 });
  }
}

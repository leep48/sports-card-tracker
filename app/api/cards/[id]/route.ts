import { auth0 } from "@/lib/auth0";
import { deleteCard, updateCard } from "@/lib/cards-db";
import type { CardInput } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

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
    const card = await updateCard(session.user.sub, id, input);
    if (!card) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }
    return Response.json(card);
  } catch (error) {
    console.error("Failed to update card:", error);
    return Response.json({ error: "Failed to save card." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const deleted = await deleteCard(session.user.sub, id);
    if (!deleted) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete card:", error);
    return Response.json({ error: "Failed to delete card." }, { status: 500 });
  }
}

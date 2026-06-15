import { auth } from "@/lib/auth";
import { getItemDetailById } from "@/lib/db/items";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemDetailById(id, userEmail);

  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  return Response.json({ item });
}

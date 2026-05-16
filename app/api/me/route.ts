import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: Request) {
  const user = getUserFromToken(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}
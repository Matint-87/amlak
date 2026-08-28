import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/src/lib/adminAuth";

export async function GET() {
  const authenticated = await isAdminRequestAuthenticated();
  return NextResponse.json({ authenticated });
}

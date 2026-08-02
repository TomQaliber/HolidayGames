import { NextResponse } from "next/server";
import { isValidPin } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const pin = String(body.pin ?? "");

  if (!isValidPin(pin)) {
    return NextResponse.json({ error: "Wrong PIN — try again!" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}

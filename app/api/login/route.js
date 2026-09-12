import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "../../../lib/auth";

export async function POST(request) {
  const { password } = await request.json();
  const correctPassword = process.env.APP_PASSWORD || "changeme";

  if (password !== correctPassword) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}

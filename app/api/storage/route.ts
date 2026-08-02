import { NextResponse } from "next/server";
import { hasKvConfig } from "@/lib/kv";

export async function GET() {
  return NextResponse.json({
    mode: hasKvConfig() ? "redis" : "local",
  });
}

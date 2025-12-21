import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Discord code verification has been disabled." },
    { status: 410 } // 410 = Gone
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Discord code verification has been disabled." },
    { status: 410 }
  );
}

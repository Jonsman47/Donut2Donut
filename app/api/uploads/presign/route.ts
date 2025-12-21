import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  try { await requireUser(); } catch { return NextResponse.json({ error: "Login required" }, { status: 401 }); }
  const { filename } = await req.json();

  // TODO: implement S3/R2 presigned uploads + watermark worker
  return NextResponse.json({
    uploadUrl: "TODO_PRESIGNED_URL",
    fileUrl: `https://your-cdn.example/${encodeURIComponent(filename)}`
  });
}

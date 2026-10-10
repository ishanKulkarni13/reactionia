import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin";

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(30),
  department: z.string().trim().min(1),
  best: z.number().int().min(0).max(300),
  mobileNumber: z.string().trim().max(20).optional().or(z.literal("")),
});

function unauthorized() {
  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
}

function normalizeMobileNumber(mobileNumber: string | undefined) {
  if (!mobileNumber?.trim()) return null;
  const normalized = mobileNumber.replace(/[\s()-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(normalized) ? normalized : null;
}

export async function GET(request: Request) {
  await connection();
  if (!isAdminRequest(request)) return unauthorized();

  try {
    const players = await prisma.player.findMany({
      orderBy: [{ bestScore: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        publicUid: true,
        name: true,
        mobileNumber: true,
        bestScore: true,
        playCount: true,
        department: { select: { id: true, name: true } },
      },
    });
    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json({ players, departments });
  } catch (error) {
    console.error("Failed to load admin players:", error);
    return NextResponse.json({ error: "Unable to load players" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  await connection();
  if (!isAdminRequest(request)) return unauthorized();

  try {
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid player values" }, { status: 400 });
    }

    const { id, name, department, best, mobileNumber } = parsed.data;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    if (mobileNumber?.trim() && !normalizedMobileNumber) {
      return NextResponse.json(
        { error: "Enter a valid mobile number with 7 to 15 digits." },
        { status: 400 },
      );
    }
    const departmentRecord = await prisma.department.findFirst({
      where: { name: department, active: true },
      select: { id: true },
    });
    if (!departmentRecord) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }

    const player = await prisma.player.update({
      where: { id },
      data: {
        name,
        normalizedName: name.toLocaleLowerCase(),
        mobileNumber: normalizedMobileNumber,
        departmentId: departmentRecord.id,
        bestScore: best,
      },
      select: {
        id: true,
        publicUid: true,
        name: true,
        mobileNumber: true,
        bestScore: true,
        playCount: true,
        department: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ player });
  } catch (error) {
    console.error("Failed to update admin player:", error);
    return NextResponse.json({ error: "Unable to update player" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await connection();
  if (!isAdminRequest(request)) return unauthorized();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (url.searchParams.get("all") === "1") {
      await prisma.player.deleteMany();
      return NextResponse.json({ ok: true });
    }
    if (!id) {
      return NextResponse.json({ error: "Player id is required" }, { status: 400 });
    }
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete admin player:", error);
    return NextResponse.json({ error: "Unable to delete player" }, { status: 500 });
  }
}

import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const playerSchema = z.object({
  name: z.string().trim().min(1).max(30),
  department: z.string().trim().min(1),
  mobileNumber: z.string().trim().max(20).optional().or(z.literal("")),
});

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function normalizeMobileNumber(mobileNumber: string | undefined) {
  if (!mobileNumber?.trim()) return null;
  const normalized = mobileNumber.replace(/[\s()-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(normalized) ? normalized : null;
}

function createPublicUid() {
  return String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
}

export async function POST(request: Request) {
  await connection();

  try {
    const parsed = playerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid player details" }, { status: 400 });
    }

    const { name, department, mobileNumber } = parsed.data;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    if (mobileNumber?.trim() && !normalizedMobileNumber) {
      return NextResponse.json(
        { error: "Enter a valid mobile number with 7 to 15 digits." },
        { status: 400 },
      );
    }
    const departmentRecord = await prisma.department.findFirst({
      where: { name: department, active: true },
      select: { id: true, name: true },
    });

    if (!departmentRecord) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }

    const normalizedName = normalizeName(name);
    const existing = await prisma.player.findFirst({
      where: normalizedMobileNumber
        ? { mobileNumber: normalizedMobileNumber }
        : { normalizedName, departmentId: departmentRecord.id },
      select: {
        id: true,
        publicUid: true,
        name: true,
        department: { select: { id: true, name: true } },
      },
    });

    if (existing) {
      return NextResponse.json({ player: existing });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const player = await prisma.player.create({
          data: {
            name,
            normalizedName,
            mobileNumber: normalizedMobileNumber,
            departmentId: departmentRecord.id,
            publicUid: createPublicUid(),
          },
          select: {
            id: true,
            publicUid: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        });
        return NextResponse.json({ player }, { status: 201 });
      } catch (error) {
        if (attempt === 4) throw error;
      }
    }

    return NextResponse.json({ error: "Unable to create player" }, { status: 500 });
  } catch (error) {
    console.error("Failed to create player:", error);
    return NextResponse.json({ error: "Unable to create player" }, { status: 500 });
  }
}

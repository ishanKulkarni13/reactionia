import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const playSchema = z.object({
  playerId: z.string().min(1),
  reaction: z.number().int().min(0).max(100),
  tapStorm: z.number().int().min(0).max(100),
  clash: z.number().int().min(0).max(100),
});

export async function POST(request: Request) {
  await connection();

  try {
    const parsed = playSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid play details" }, { status: 400 });
    }

    const { playerId, reaction, tapStorm, clash } = parsed.data;
    const total = reaction + tapStorm + clash;

    const result = await prisma.$transaction(async (tx) => {
      const player = await tx.player.findUnique({ where: { id: playerId } });
      if (!player) return null;

      const play = await tx.play.create({
        data: { playerId, total, reaction, tapStorm, clash },
        select: { id: true, total: true },
      });

      await tx.player.update({
        where: { id: playerId },
        data: {
          playCount: { increment: 1 },
          bestScore: Math.max(player.bestScore, total),
        },
      });

      return { play, bestScore: Math.max(player.bestScore, total) };
    });

    if (!result) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to record play:", error);
    return NextResponse.json({ error: "Unable to record play" }, { status: 500 });
  }
}

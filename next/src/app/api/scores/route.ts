import { connection, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    const [departments, players] = await Promise.all([
      prisma.department.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { name: true },
      }),
      prisma.player.findMany({
        orderBy: [{ bestScore: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          publicUid: true,
          name: true,
          department: { select: { name: true } },
          bestScore: true,
          playCount: true,
        },
      }),
    ]);

    const publicPlayers = players.map((player) => ({
      id: player.id,
      publicUid: player.publicUid,
      name: player.name,
      branch: player.department.name,
      best: player.bestScore,
      plays: player.playCount,
    }));

    const summary = departments
      .map(({ name: branch }) => {
        const departmentPlayers = publicPlayers.filter(
          (player) => player.branch === branch,
        );
        const total = departmentPlayers.reduce(
          (sum, player) => sum + player.best,
          0,
        );

        return {
          branch,
          players: departmentPlayers.length,
          total,
          avg: departmentPlayers.length
            ? Math.round(total / departmentPlayers.length)
            : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return NextResponse.json(
      {
        branches: departments.map(({ name }) => name),
        players: publicPlayers,
        summary,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load scores:", error);
    return NextResponse.json(
      { error: "Unable to load scores" },
      { status: 500 },
    );
  }
}

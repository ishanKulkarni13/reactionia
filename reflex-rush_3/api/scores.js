import { redis } from "./_redis.js";
import { BRANCHES, MAX_SCORE } from "./_config.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { name, branch, score } = req.body || {};
      const n = String(name || "").trim().slice(0, 30);
      const s = Math.floor(Number(score));
      if (!n || !BRANCHES.includes(branch) || !(s >= 0 && s <= MAX_SCORE))
        return res.status(400).json({ error: "Invalid entry" });
      const id = `${n}|${branch}`.toLowerCase();
      const old = await redis("HGET", "scores", id);
      const p = old ? JSON.parse(old) : { name: n, branch, best: 0, plays: 0 };
      p.best = Math.max(p.best, s);
      p.plays += 1;
      p.updated = Date.now();
      await redis("HSET", "scores", id, JSON.stringify(p));
      return res.json({ ok: true, best: p.best });
    }
    const flat = (await redis("HGETALL", "scores")) || [];
    const players = [];
    for (let i = 0; i < flat.length; i += 2) players.push({ id: flat[i], ...JSON.parse(flat[i + 1]) });
    players.sort((a, b) => b.best - a.best);
    const map = {};
    BRANCHES.forEach((b) => (map[b] = { branch: b, players: 0, total: 0 }));
    players.forEach((p) => { if (map[p.branch]) { map[p.branch].players++; map[p.branch].total += p.best; } });
    const summary = Object.values(map)
      .map((b) => ({ ...b, avg: b.players ? Math.round(b.total / b.players) : 0 }))
      .sort((a, b) => b.total - a.total);
    res.setHeader("Cache-Control", "no-store");
    res.json({ branches: BRANCHES, players, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

import { redis } from "./_redis.js";
import { BRANCHES } from "./_config.js";

export default async function handler(req, res) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || req.headers["x-admin-password"] !== pw) return res.status(401).json({ error: "Wrong password" });
  try {
    if (req.method === "DELETE") {
      if (req.query.all) await redis("DEL", "scores");
      else await redis("HDEL", "scores", req.query.id);
      return res.json({ ok: true });
    }
    if (req.method === "PUT") {
      const { id, name, branch, best } = req.body || {};
      const raw = await redis("HGET", "scores", id);
      if (!raw) return res.status(404).json({ error: "Not found" });
      const b = Number(best);
      if (!String(name || "").trim() || !BRANCHES.includes(branch) || !(b >= 0 && b <= 9999))
        return res.status(400).json({ error: "Invalid values" });
      const p = { ...JSON.parse(raw), name: String(name).trim().slice(0, 30), branch, best: Math.floor(b) };
      await redis("HSET", "scores", id, JSON.stringify(p));
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

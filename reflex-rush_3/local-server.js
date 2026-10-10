import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BRANCHES, MAX_SCORE } from "./api/_config.js";

const store = {};
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const PW = process.env.ADMIN_PASSWORD || "test";
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
};
const body = (req) =>
  new Promise((r) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => {
      try {
        r(JSON.parse(d || "{}"));
      } catch {
        r({});
      }
    });
  });
const send = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};

http
  .createServer(async (req, res) => {
    const u = new URL(req.url, "http://x");
    if (u.pathname === "/api/scores") {
      if (req.method === "POST") {
        const { name, branch, score } = await body(req);
        const n = String(name || "")
            .trim()
            .slice(0, 30),
          s = Math.floor(Number(score));
        if (!n || !BRANCHES.includes(branch) || !(s >= 0 && s <= MAX_SCORE))
          return send(res, 400, { error: "Invalid entry" });
        const id = `${n}|${branch}`.toLowerCase();
        const p = store[id] || { name: n, branch, best: 0, plays: 0 };
        p.best = Math.max(p.best, s);
        p.plays++;
        store[id] = p;
        return send(res, 200, { ok: true });
      }
      const players = Object.entries(store)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => b.best - a.best);
      const summary = BRANCHES.map((b) => {
        const ps = players.filter((p) => p.branch === b),
          total = ps.reduce((a, p) => a + p.best, 0);
        return {
          branch: b,
          players: ps.length,
          total,
          avg: ps.length ? Math.round(total / ps.length) : 0,
        };
      }).sort((a, b) => b.total - a.total);
      return send(res, 200, { branches: BRANCHES, players, summary });
    }
    if (u.pathname === "/api/admin") {
      if (req.headers["x-admin-password"] !== PW)
        return send(res, 401, { error: "Wrong password" });
      if (req.method === "DELETE") {
        if (u.searchParams.get("all")) for (const k in store) delete store[k];
        else delete store[u.searchParams.get("id")];
        return send(res, 200, { ok: true });
      }
      if (req.method === "PUT") {
        const { id, name, branch, best } = await body(req);
        if (!store[id]) return send(res, 404, { error: "Not found" });
        Object.assign(store[id], { name, branch, best: Number(best) });
        return send(res, 200, { ok: true });
      }
      return send(res, 405, { error: "Method not allowed" });
    }
    let requestedPath;
    try {
      requestedPath = decodeURIComponent(u.pathname);
    } catch {
      res.writeHead(400);
      return res.end("Invalid path");
    }
    const f = path.resolve(
      PUBLIC_DIR,
      requestedPath === "/" ? "index.html" : `.${requestedPath}`,
    );
    if (f !== PUBLIC_DIR && !f.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    fs.readFile(f, (e, d) => {
      if (e) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(f)] || "text/plain",
      });
      res.end(d);
    });
  })
  .listen(3000, () =>
    console.log("Open http://localhost:3000  (admin password: test)"),
  );

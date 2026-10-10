"use client";

import { useEffect, useState } from "react";

type BoardPlayer = {
  id: string;
  name: string;
  branch: string;
  best: number;
};

type BoardSummary = {
  branch: string;
  players: number;
  total: number;
  avg: number;
};

type BoardData = {
  branches: string[];
  players: BoardPlayer[];
  summary: BoardSummary[];
};

export default function Leaderboard() {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [message, setMessage] = useState("Loading leaderboard...");

  useEffect(() => {
    async function loadBoard() {
      try {
        const response = await fetch("/api/scores", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load leaderboard");
        setBoard((await response.json()) as BoardData);
        setMessage("The latest scores from campus.");
      } catch {
        setMessage("Leaderboard will appear after the database is connected.");
      }
    }

    void loadBoard();
  }, []);

  const max = Math.max(1, ...(board?.summary.map((item) => item.total) ?? [0]));

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-intro">
        <span className="round-label">LIVE SCORES</span>
        <h1>Who has the <em>fastest</em> hands?</h1>
        <p className="lead">See how every department and player is performing.</p>
      </div>
      <section className="boards">
        <div className="card">
          <h2>Department leaderboard</h2>
          <p className="hint">{message}</p>
          <ol>
            {(board?.summary ?? []).map((item, index) => (
              <li key={item.branch}>
                <span className={`rk r${index + 1}`}>{index + 1}</span>
                <div className="nm">
                  <b>{item.branch}</b>
                  <div className="bar"><i style={{ width: `${(item.total / max) * 100}%` }} /></div>
                  <small>{item.players ? `${item.players} player${item.players > 1 ? "s" : ""}, avg ${item.avg}` : "No players yet"}</small>
                </div>
                <span className="pt">{item.total}<small>PTS</small></span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card">
          <h2>Top players</h2>
          <p className="hint">The fastest hands on campus.</p>
          <ol>
            {(board?.players.slice(0, 10) ?? []).map((item, index) => (
              <li key={item.id}>
                <span className={`rk r${index + 1}`}>{index + 1}</span>
                <div className="nm"><b>{item.name}</b><small>{item.branch}</small></div>
                <span className="pt">{item.best}<small>PTS</small></span>
              </li>
            ))}
          </ol>
          {board && !board.players.length && <p className="empty">Be the first on the board.</p>}
        </div>
      </section>
    </main>
  );
}

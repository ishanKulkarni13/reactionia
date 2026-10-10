"use client";

import { useState } from "react";

type Department = { id: string; name: string };
type Player = {
  id: string;
  publicUid: string;
  name: string;
  mobileNumber: string | null;
  bestScore: number;
  playCount: number;
  department: Department;
};

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  function headers() {
    return {
      "Content-Type": "application/json",
      "x-admin-password": password,
    };
  }

  async function load() {
    const response = await fetch("/api/admin/players", { headers: headers() });
    const data = (await response.json()) as {
      players?: Player[];
      departments?: Department[];
      error?: string;
    };
    if (!response.ok) {
      setMessage(data.error ?? "Unable to load admin data");
      return;
    }
    setPlayers(data.players ?? []);
    setDepartments(data.departments ?? []);
    setLoaded(true);
    setMessage("");
  }

  async function save(player: Player) {
    const response = await fetch("/api/admin/players", {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({
        id: player.id,
        name: player.name,
        department: player.department.name,
        best: player.bestScore,
        mobileNumber: player.mobileNumber ?? "",
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Unable to save player");
      return;
    }
    setMessage("Player saved.");
    await load();
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/players?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "Unable to delete player");
      return;
    }
    await load();
  }

  async function removeAll() {
    if (!window.confirm("Delete every player and play record?")) return;
    const response = await fetch("/api/admin/players?all=1", {
      method: "DELETE",
      headers: headers(),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "Unable to delete players");
      return;
    }
    await load();
  }

  function exportCsv() {
    const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["Public UID", "Name", "Department", "Best", "Plays"],
      ...players.map((player) => [
        player.publicUid,
        player.name,
        player.department.name,
        player.bestScore,
        player.playCount,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(quote).join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reflex-rush-players.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <section className="card">
        <label htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="main" type="button" onClick={load}>
          Load scoreboard
        </button>
        {message && <p className="err">{message}</p>}
      </section>

      {loaded && (
        <section className="card admin-table-card">
          <div className="admin-actions">
            <button className="main alt small-button" type="button" onClick={exportCsv}>
              Export CSV
            </button>
            <button className="main delete-button small-button" type="button" onClick={removeAll}>
              Delete ALL records
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Public UID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Department</th>
                  <th>Best</th>
                  <th>Plays</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>{player.publicUid}</td>
                    <td>
                      <input
                        value={player.name}
                        onChange={(event) =>
                          setPlayers((items) =>
                            items.map((item) =>
                              item.id === player.id ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={player.mobileNumber ?? ""}
                        placeholder="Optional"
                        inputMode="tel"
                        onChange={(event) =>
                          setPlayers((items) =>
                            items.map((item) =>
                              item.id === player.id
                                ? { ...item, mobileNumber: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={player.department.name}
                        onChange={(event) =>
                          setPlayers((items) =>
                            items.map((item) =>
                              item.id === player.id
                                ? {
                                    ...item,
                                    department: {
                                      id: item.department.id,
                                      name: event.target.value,
                                    },
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        {departments.map((department) => (
                          <option key={department.id} value={department.name}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={player.bestScore}
                        onChange={(event) =>
                          setPlayers((items) =>
                            items.map((item) =>
                              item.id === player.id
                                ? { ...item, bestScore: Number(event.target.value) }
                                : item,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>{player.playCount}</td>
                    <td className="action-cell">
                      <button className="main alt small-button" type="button" onClick={() => save(player)}>
                        Save
                      </button>
                      <button className="main delete-button small-button" type="button" onClick={() => remove(player.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!players.length && <p className="empty">No players yet.</p>}
          </div>
        </section>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Department = { name: string };
type DepartmentData = {
  branches: string[];
};
type Player = {
  id: string;
  publicUid: string;
  name: string;
  department: { id: string; name: string };
};
type Round = "registration" | "intro" | "reaction" | "storm" | "clash" | "result";
type Scores = { reaction: number; tapStorm: number; clash: number };

const roundInfo = {
  reaction: {
    title: "Reaction",
    description: "Wait for green, then tap as fast as you can. You get 2 tries.",
  },
  storm: {
    title: "Tap Storm",
    description: "Tap 10 dots as quickly as possible. Faster finishes score more.",
  },
  clash: {
    title: "Colour Clash",
    description: "Tap the button for the ink colour you see, not the word.",
  },
} as const;

const colors = [
  { name: "Red", value: "#e63946" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#7c3aed" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function buzz() {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
}

export default function Game() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [round, setRound] = useState<Round>("registration");
  const [introRound, setIntroRound] = useState<"reaction" | "storm" | "clash">("reaction");
  const [scores, setScores] = useState<Scores>({ reaction: 0, tapStorm: 0, clash: 0 });
  const [error, setError] = useState("");
  const [roundNumber, setRoundNumber] = useState(1);

  useEffect(() => {
    void refreshBoard();
  }, []);

  async function refreshBoard() {
    try {
      const response = await fetch("/api/scores", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load leaderboard");
      const data = (await response.json()) as DepartmentData;
      setDepartments(data.branches.map((name) => ({ name })));
    } catch {
      setError("Departments could not be loaded. Please refresh and try again.");
    }
  }

  async function startGame() {
    setError("");
    if (!name.trim() || !department) {
      setError("Add your name and choose your department.");
      return;
    }

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department, mobileNumber }),
      });
      const data = (await response.json()) as { player?: Player; error?: string };
      if (!response.ok || !data.player) throw new Error(data.error ?? "Unable to start");
      setPlayer(data.player);
      setRound("intro");
      setIntroRound("reaction");
      setRoundNumber(1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start the game.");
    }
  }

  function nextIntro(nextRound: "reaction" | "storm" | "clash") {
    setIntroRound(nextRound);
    setRound(nextRound);
  }

  function finishRound(roundName: keyof Scores, score: number) {
    const nextScores = { ...scores, [roundName]: score };
    setScores(nextScores);
    if (roundName === "reaction") {
      setRoundNumber(2);
      setIntroRound("storm");
      setRound("intro");
    } else if (roundName === "tapStorm") {
      setRoundNumber(3);
      setIntroRound("clash");
      setRound("intro");
    } else {
      setRound("result");
      void submitPlay(nextScores);
    }
  }

  async function submitPlay(finalScores: Scores) {
    if (!player) return;
    try {
      const response = await fetch("/api/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, ...finalScores }),
      });
      if (!response.ok) {
        throw new Error("Unable to save your result.");
      }
      await refreshBoard();
    } catch {
      setError("Your result is ready, but it could not be saved.");
    }
  }

  function reset() {
    setRound("registration");
    setPlayer(null);
    setScores({ reaction: 0, tapStorm: 0, clash: 0 });
    setName("");
    setMobileNumber("");
    setDepartment("");
    setError("");
  }

  return (
    <main className="game-shell">
      {round === "registration" && (
        <Registration
          name={name}
          department={department}
          departments={departments}
          mobileNumber={mobileNumber}
          error={error}
          onNameChange={setName}
          onMobileNumberChange={setMobileNumber}
          onDepartmentChange={setDepartment}
          onStart={startGame}
        />
      )}
      {round !== "registration" && round !== "result" && (
        <GameStage
          round={round}
          roundNumber={roundNumber}
          introRound={introRound}
          onIntro={() => nextIntro(introRound)}
          onFinish={finishRound}
        />
      )}
      {round === "result" && player && (
        <Result player={player} scores={scores} error={error} onReset={reset} />
      )}
    </main>
  );
}

function Registration(props: {
  name: string;
  department: string;
  departments: Department[];
  mobileNumber: string;
  error: string;
  onNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStart: () => void;
}) {
  return (
    <section className="registration">
      <h1>How fast are <em>you?</em></h1>
      <p className="lead">Three reflex rounds. Under a minute. Every point you score goes to your department.</p>
      <div className="card">
        <span className="sticker">FREE TO PLAY</span>
        <label htmlFor="name">Your name</label>
        <input id="name" value={props.name} onChange={(event) => props.onNameChange(event.target.value)} maxLength={30} autoComplete="name" placeholder="e.g. Aditi Kulkarni" />
        <label htmlFor="department">Your department</label>
        <select id="department" value={props.department} onChange={(event) => props.onDepartmentChange(event.target.value)}>
          <option value="">Choose your department</option>
          {props.departments.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
        </select>
        <label htmlFor="mobile-number">Mobile number <span className="optional">(optional)</span></label>
        <input
          id="mobile-number"
          value={props.mobileNumber}
          onChange={(event) => props.onMobileNumberChange(event.target.value)}
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          placeholder="For returning players"
        />
        <button className="main" type="button" onClick={props.onStart}>Start the rush</button>
        {props.error && <p className="err">{props.error}</p>}
      </div>
    </section>
  );
}

function GameStage(props: {
  round: Round;
  roundNumber: number;
  introRound: "reaction" | "storm" | "clash";
  onIntro: () => void;
  onFinish: (round: keyof Scores, score: number) => void;
}) {
  const info = roundInfo[props.introRound];
  return (
    <section className="game-stage">
      <div className="hud"><span>ROUND {props.roundNumber} / 3</span><span className="pips"><i className={props.roundNumber >= 1 ? "on" : ""} /><i className={props.roundNumber >= 2 ? "on" : ""} /><i className={props.roundNumber >= 3 ? "on" : ""} /></span></div>
      {props.round === "intro" && <div className="stage intro"><div><span className="round-label">ROUND {props.roundNumber}</span><h2>{info.title}</h2><p>{info.description}</p><button className="main" onClick={props.onIntro}>Got it, I&apos;m ready</button></div></div>}
      {props.round === "reaction" && <ReactionRound onFinish={(score) => props.onFinish("reaction", score)} />}
      {props.round === "storm" && <StormRound onFinish={(score) => props.onFinish("tapStorm", score)} />}
      {props.round === "clash" && <ClashRound onFinish={(score) => props.onFinish("clash", score)} />}
    </section>
  );
}

function ReactionRound({ onFinish }: { onFinish: (score: number) => void }) {
  const [attempt, setAttempt] = useState(1);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState("");
  const [points, setPoints] = useState(0);
  const startedAt = useRef(0);
  const locked = useRef(false);
  useEffect(() => {
    locked.current = false;
    const timer = window.setTimeout(() => { setReady(true); startedAt.current = performance.now(); }, 1000 + Math.random() * 1500);
    return () => window.clearTimeout(timer);
  }, [attempt]);
  function tap() {
    if (locked.current) return;
    locked.current = true;
    buzz();
    const ms = ready ? performance.now() - startedAt.current : null;
    const score = ms === null ? 0 : clamp(Math.round((550 - ms) / 7), 0, 50);
    setPoints((value) => value + score);
    setResult(ms === null ? "Too early! +0" : `${Math.round(ms)} ms · +${score} pts`);
    setReady(false);
    if (attempt === 2) window.setTimeout(() => onFinish(points + score), 900);
    else window.setTimeout(() => { setAttempt(2); setResult(""); }, 900);
  }
  return <button className={`stage ${ready ? "go" : result ? "res" : "wait"}`} onPointerDown={tap}>{result || (ready ? "TAP!" : "Wait for green...")}</button>;
}

function StormRound({ onFinish }: { onFinish: (score: number) => void }) {
  const [count, setCount] = useState(0);
  const startedAt = useRef<number | null>(null);
  const finished = useRef(false);
  const [position, setPosition] = useState({ left: 30, top: 30 });
  useEffect(() => {
    startedAt.current = performance.now();
  }, []);
  function tap() {
    if (finished.current) return;
    buzz();
    if (count === 9) {
      finished.current = true;
      const elapsed = performance.now() - (startedAt.current ?? performance.now());
      onFinish(clamp(Math.round(100 - (elapsed / 1000 - 5) * 12), 0, 100));
    } else {
      setCount((value) => value + 1);
      setPosition({ left: 8 + Math.random() * 76, top: 8 + Math.random() * 76 });
    }
  }
  return <div className="stage arena"><span className="stage-count">TAP STORM {count + 1}/10</span><button aria-label="Tap dot" className="dot" style={{ left: `${position.left}%`, top: `${position.top}%` }} onPointerDown={tap} /></div>;
}

function ClashRound({ onFinish }: { onFinish: (score: number) => void }) {
  const [sequence] = useState(createColourSequence);
  const [step, setStep] = useState(0);
  const endAt = useRef(0);
  const scoreRef = useRef(0);
  const finished = useRef(false);
  useEffect(() => {
    endAt.current = performance.now() + 6000;
    const timer = window.setInterval(() => {
      if (performance.now() >= endAt.current) {
        window.clearInterval(timer);
        finished.current = true;
        onFinish(clamp(scoreRef.current, 0, 100));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [onFinish]);
  function choose(index: number) {
    if (finished.current) return;
    buzz();
    const nextScore = scoreRef.current + (index === sequence[step].ink ? 10 : -5);
    scoreRef.current = nextScore;
    setStep((value) => (value + 1) % sequence.length);
  }
  const pair = sequence[step];
  return <div className="stage clash"><div className="colour-word" style={{ color: colors[pair.ink].value }}>{colors[pair.word].name}</div><div className="options">{colors.map((color, index) => <button key={color.name} onPointerDown={() => choose(index)}>{color.name}</button>)}</div></div>;
}

function createColourSequence() {
  const pairs = colors.flatMap((_, ink) => colors.map((__, word) => ({ ink, word })));
  for (let index = pairs.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pairs[index], pairs[swapIndex]] = [pairs[swapIndex], pairs[index]];
  }
  return pairs;
}

function Result({ player, scores, error, onReset }: { player: Player; scores: Scores; error: string; onReset: () => void }) {
  const total = scores.reaction + scores.tapStorm + scores.clash;
  return <section className="result card"><h2>Nice run, {player.name}!</h2><div className="score">{total}</div><span className="title">{total >= 240 ? "Lightning Reflexes" : total >= 180 ? "Sharp Shooter" : total >= 110 ? "Quick Hands" : "Warming Up"}</span><p>Player UID: <b>{player.publicUid}</b></p><div className="parts"><div><b>{scores.reaction}</b>Reaction</div><div><b>{scores.tapStorm}</b>Tap Storm</div><div><b>{scores.clash}</b>Colour Clash</div></div>{error && <p className="err">{error}</p>}<button className="main" onClick={onReset}>Next player</button></section>;
}

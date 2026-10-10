import Game from "@/components/game/Game";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="band">
        <div>
          IEEE VIT PUNE&nbsp; * &nbsp;REFLEX RUSH&nbsp; * &nbsp;REPRESENT YOUR
          DEPARTMENT&nbsp; * &nbsp;
        </div>
      </div>
      <div className="wrap">
        <header className="top">
          <div className="logo">
            <b>IEEE</b>
            <span>
              VIT Pune
              <small>Student Branch</small>
            </span>
          </div>
          <Link className="board-link" href="/leaderboard" aria-label="View leaderboard">
            <span aria-hidden="true">▥</span> Leaderboard
          </Link>
        </header>
        <Game />
        <footer>
          Made with reflexes by <b>IEEE VIT Pune</b> Student Branch
        </footer>
      </div>
    </>
  );
}

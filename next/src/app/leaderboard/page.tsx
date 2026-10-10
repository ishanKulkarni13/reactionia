import Link from "next/link";
import Leaderboard from "@/components/leaderboard/Leaderboard";

export default function LeaderboardPage() {
  return (
    <>
      <div className="band">
        <div>IEEE VIT PUNE&nbsp; * &nbsp;REFLEX RUSH&nbsp; * &nbsp;LIVE SCORES&nbsp; * &nbsp;</div>
      </div>
      <div className="wrap">
        <header className="top">
          <Link className="logo logo-link" href="/" aria-label="Return to Reflex Rush">
            <b>IEEE</b>
            <span>VIT Pune<small>Student Branch</small></span>
          </Link>
          <Link className="board-link" href="/" aria-label="Play Reflex Rush">
            <span aria-hidden="true">↩</span> Play
          </Link>
        </header>
        <Leaderboard />
        <footer>Made with reflexes by <b>IEEE VIT Pune</b> Student Branch</footer>
      </div>
    </>
  );
}

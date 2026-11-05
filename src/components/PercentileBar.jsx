import { useEffect, useState } from 'react';
import { sound } from '../utils/audio';

export function PercentileBar({ percent }) {
  const SEGMENTS = 20;
  const target = Math.round((percent / 100) * SEGMENTS);
  const [shown, setShown] = useState(0);

  // light the blocks up one at a time
  useEffect(() => {
    if (shown >= target) return;
    const t = setTimeout(() => {
      sound.playBeep();
      setShown((s) => s + 1);
    }, 60);
    return () => clearTimeout(t);
  }, [shown, target]);

  const color =
    percent >= 75 ? 'bg-emerald-400' : percent >= 40 ? 'bg-yellow-400' : 'bg-red-500';

  // Dynamic Football Title Logic
  const getRankTitle = () => {
    if (percent === 0) return "📉 RELEGATION...YIKES (BOTTOM OF THE LEAGUE)";
    if (percent < 30) return "🪵 LOWER TABLE SHUFFLER";
    if (percent < 60) return "⚽ MID-TABLE CLUB";
    if (percent < 90) return "🇪🇺 EUROPEAN CHALLENGER";
    return "🏆 TITLE CONTENDER!";
  };

  return (
    <div className="font-mono mt-4 mb-2">
      <div className="flex items-center">
        <div className="flex flex-1 gap-1 p-1 border-2 border-slate-500 rounded bg-slate-950">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <div key={i} className={`h-6 flex-1 ${i < shown ? color : 'bg-slate-800'}`} />
          ))}
        </div>
        <div className="w-1.5 h-4 bg-slate-500 rounded-r" /> {/* battery cap */}
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] text-emerald-300 font-bold tracking-wider">
          {percent > 0 || (percent === 0 && target === 0 && shown === 0) ? (
            <>
              BETTER THAN {percent}% OF TODAY'S PLAYERS
              <span className="block text-[9px] text-yellow-400 mt-1 uppercase tracking-widest font-black">
                {getRankTitle()}
              </span>
            </>
          ) : (
            "CALIBRATING... BE ONE OF THE FIRST"
          )}
        </p>
      </div>
    </div>
  );
}
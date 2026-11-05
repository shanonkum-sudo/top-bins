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
      sound.playBeep(); // Added the beep sound here
      setShown((s) => s + 1);
    }, 60);
    return () => clearTimeout(t);
  }, [shown, target]);

  const color =
    percent >= 75 ? 'bg-emerald-400' : percent >= 40 ? 'bg-yellow-400' : 'bg-red-500';

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
      <p className="mt-2 text-center text-[10px] text-emerald-300 font-bold tracking-wider">
        {percent > 0 ? `BETTER THAN ${percent}% OF TODAY'S PLAYERS` : "CALIBRATING... BE ONE OF THE FIRST"}
      </p>
    </div>
  );
}
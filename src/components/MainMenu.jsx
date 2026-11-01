import React, { useState } from 'react';
import { PixelBall, PixelCrowdTop } from './PixelSprites';
import { sound } from '../utils/audio';

export default function MainMenu({
  onStartDaily,
  onStartCards,
  onStartEndless,
  hasPlayedToday,
  viewTodaysResults,
  stats
}) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const handleToggleMusic = () => {
    sound.playBeep();
    const isPlaying = sound.toggleLobbyMusic();
    setIsPlayingMusic(isPlaying);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 select-none relative">
      
      {/* Crowd Backdrop */}
      <div className="bg-[#0b1f13] border-2 border-[#1e4a2b] rounded-t p-1">
        <PixelCrowdTop excitement="medium" />
      </div>

      {/* Retro Title Logo (with What's New '!' button positioned in top area) */}
      <div className="text-center my-2 bg-[#08180e] border-2 border-[#1e4a2b] py-3 px-2 rounded shadow-inner relative">
        
        {/* Compact What's New '!' Button */}
        <button
          onClick={() => {
            sound.playBeep();
            setShowWhatsNew(true);
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-[#1e4a2b] rounded-full flex items-center justify-center font-black text-xs shadow transition-all cursor-pointer"
          title="What's New"
        >
          !
        </button>

        <div className="flex justify-center items-center gap-2 mb-1">
          <PixelBall size={20} />
          <h1 className="text-xl sm:text-2xl font-black text-yellow-400 tracking-wider uppercase drop-shadow">
            TOP BINS
          </h1>
          <PixelBall size={20} />
        </div>
        <p className="text-[7px] text-green-400 tracking-widest uppercase">
          RETRO FOOTBALL TRIVIA ARCADE
        </p>
      </div>

      {/* Player Career Stats HUD */}
      <div className="bg-black/60 border border-[#1e4a2b] rounded p-2 mb-2 grid grid-cols-4 gap-1 text-center divide-x divide-[#1e4a2b]">
        <div>
          <div className="text-[6px] text-gray-400 uppercase tracking-widest mb-0.5">Played</div>
          <div className="text-[10px] font-black text-white font-mono">{stats.played}</div>
        </div>
        <div>
          <div className="text-[6px] text-gray-400 uppercase tracking-widest mb-0.5">Streak</div>
          <div className="text-[10px] font-black text-yellow-400 font-mono">{stats.currentStreak}</div>
        </div>
        <div>
          <div className="text-[6px] text-gray-400 uppercase tracking-widest mb-0.5">Max Strk</div>
          <div className="text-[10px] font-black text-white font-mono">{stats.maxStreak}</div>
        </div>
        <div>
          <div className="text-[6px] text-gray-400 uppercase tracking-widest mb-0.5">Total m</div>
          <div className="text-[10px] font-black text-green-400 font-mono">{stats.totalDist}</div>
        </div>
      </div>

      {/* Chiptune Arcade Music Control */}
      <div className="flex items-center justify-between bg-black/50 border border-[#1e4a2b] p-2 rounded mb-2">
        <div className="flex items-center gap-1.5 text-[7px] text-gray-300">
          <span>🕹️</span>
          <span>CHIPTUNE LOBBY BGM</span>
        </div>
        <button
          type="button"
          onClick={handleToggleMusic}
          className={`text-[7px] px-2.5 py-1 rounded font-bold uppercase transition-all shadow-sm cursor-pointer ${
            isPlayingMusic
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-yellow-400 text-black hover:bg-yellow-300'
          }`}
        >
          {isPlayingMusic ? 'MUTE 🔇' : 'PLAY 🔊'}
        </button>
      </div>

      {/* Menu Game Modes */}
      <div className="space-y-2 my-auto">
        {hasPlayedToday ? (
          <button
            onClick={viewTodaysResults}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black p-3 rounded border-2 border-emerald-400 text-left transition-all shadow-lg flex justify-between items-center group cursor-pointer"
          >
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <span>📋</span> VIEW TODAY'S RESULTS
              </div>
              <div className="text-[7px] text-emerald-100 font-normal mt-0.5">
                Matchday complete! Come back tomorrow.
              </div>
            </div>
            <span className="text-xs group-hover:translate-x-1 transition-transform">➔</span>
          </button>
        ) : (
          <button
            onClick={onStartDaily}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black p-3 rounded border-2 border-yellow-500 text-left transition-all shadow-lg flex justify-between items-center group cursor-pointer animate-pulse"
          >
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <span>▶</span> DAILY FIXTURE (7 ROUNDS)
              </div>
              <div className="text-[7px] text-gray-800 font-normal mt-0.5">
                Europe's top 5 leagues • 20s shot clock
              </div>
            </div>
            <span className="text-xs group-hover:translate-x-1 transition-transform">⚽</span>
          </button>
        )}

        {/* 2-CARD SUDDEN DEATH BUTTON */}
        <button
          onClick={onStartCards}
          className="w-full bg-[#0d2216] hover:bg-[#133220] active:scale-95 border-2 border-red-500/80 p-2.5 rounded text-left transition-all shadow-md flex justify-between items-center group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-wider">
                🟨🟥 2-CARD SUDDEN DEATH
              </span>
              <span className="text-[6px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                NEW
              </span>
            </div>
            <div className="text-[6px] text-gray-300 mt-0.5">
              Warning ➔ Yellow ➔ Red Card • 1 VAR Check
            </div>
          </div>
          <span className="text-xs text-yellow-400 group-hover:translate-x-1 transition-transform">➔</span>
        </button>

        {/* ENDLESS SURVIVAL BUTTON */}
        <button
          onClick={onStartEndless}
          className="w-full bg-[#0d2216] hover:bg-[#133220] active:scale-95 border-2 border-purple-500/80 p-2.5 rounded text-left transition-all shadow-md flex justify-between items-center group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] sm:text-[9px] font-black text-purple-300 uppercase tracking-wider">
                ♾️ ENDLESS SURVIVAL
              </span>
              <span className="text-[6px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                NEW
              </span>
            </div>
            <div className="text-[6px] text-gray-300 mt-0.5">
              Shrinking timer • 15 pts per goal • Survive the run
            </div>
          </div>
          <span className="text-xs text-purple-300 group-hover:translate-x-1 transition-transform">➔</span>
        </button>
      </div>

      <div className="text-center mt-2 pt-2 border-t border-[#1e4a2b]">
        <span className="text-[7px] text-gray-400 uppercase tracking-widest">
          • SELECT A GAME MODE TO ENTER STADIUM •
        </span>
      </div>

      {/* What's New Modal Overlay */}
      {showWhatsNew && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border-2 border-yellow-500/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-zinc-200">
            
            <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-black text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                  🚀 What's New
                </h2>
                <p className="text-[8px] text-green-400 tracking-wider uppercase font-bold mt-0.5">Version 1.1 Update</p>
              </div>
              <button
                onClick={() => setShowWhatsNew(false)}
                className="text-zinc-400 hover:text-white text-base font-bold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Patch Notes */}
            <div className="space-y-2.5 text-xs text-zinc-300 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold text-sm">🟥</span>
                <p><strong className="text-white">2-Card Sudden Death:</strong> Rarity-based spectrum scoring. 3 referee strikes and you're off! VAR challenges enabled.</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold text-sm">🎙️</span>
                <p><strong className="text-white">Press Conference:</strong> Endless survival mode where the clock speeds up the longer you survive.</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold text-sm">🏆</span>
                <p><strong className="text-white">Global Leaderboards:</strong> Submit your initials to the Supabase Arcade Hall of Fame.</p>
              </div>
            </div>

            {/* Playtest Message */}
            <div className="bg-green-950/40 border border-green-800/80 p-3 rounded text-[9px] text-green-300 mb-4 leading-relaxed text-center">
              Thank you for playing the Top Bins playtest! U so goated. If there are any queries or problems, feel free to text and let me know so I TRY to fix them.
            </div>

            {/* Close Modal Button */}
            <div className="text-center">
              <button
                onClick={() => setShowWhatsNew(false)}
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
              >
                CLOSE PATCH NOTES
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
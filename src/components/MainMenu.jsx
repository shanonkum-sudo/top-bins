import React, { useState } from 'react';
import { PixelBall, PixelCrowdTop } from './PixelSprites';
import { sound } from '../utils/audio';

export default function MainMenu({ onStartDaily, hasPlayedToday, viewTodaysResults, stats }) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const handleToggleMusic = () => {
    sound.playBeep();
    const isPlaying = sound.toggleLobbyMusic();
    setIsPlayingMusic(isPlaying);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 select-none">
      {/* Crowd Backdrop */}
      <div className="bg-[#0b1f13] border-2 border-[#1e4a2b] rounded-t p-1">
        <PixelCrowdTop excitement="medium" />
      </div>

      {/* Retro Title Logo */}
      <div className="text-center my-2 bg-[#08180e] border-2 border-[#1e4a2b] py-3 px-2 rounded shadow-inner">
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

        <div className="w-full bg-[#0d2216]/60 border-2 border-gray-800 p-2.5 rounded text-left opacity-60">
          <div className="flex justify-between items-center">
            <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-wider">
              🟨 2-CARD SUDDEN DEATH
            </span>
            <span className="text-[6px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded font-bold uppercase">
              SOON
            </span>
          </div>
          <div className="text-[6px] text-gray-500 mt-0.5">
            Two wrong strikes and you're sent off
          </div>
        </div>

        <div className="w-full bg-[#0d2216]/60 border-2 border-gray-800 p-2.5 rounded text-left opacity-60">
          <div className="flex justify-between items-center">
            <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-wider">
              ♾️ ENDLESS SURVIVAL
            </span>
            <span className="text-[6px] bg-purple-950 text-purple-400 border border-purple-800 px-1.5 py-0.5 rounded font-bold uppercase">
              SOON
            </span>
          </div>
          <div className="text-[6px] text-gray-500 mt-0.5">
            Score as many meters as possible until you blank
          </div>
        </div>
      </div>

      <div className="text-center mt-2 pt-2 border-t border-[#1e4a2b]">
        <span className="text-[7px] text-gray-400 uppercase tracking-widest">
          {hasPlayedToday ? "• TRAINING GROUND CLOSED •" : "• TAP DAILY FIXTURE TO ENTER STADIUM •"}
        </span>
      </div>
    </div>
  );
}
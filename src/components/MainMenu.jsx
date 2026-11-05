import React, { useState, useEffect } from 'react';
import { PixelBall, PixelCrowdTop } from './PixelSprites';
import { sound } from '../utils/audio';

export default function MainMenu({
  onStartDaily,
  onStartCards,
  onStartEndless,
  hasPlayedToday,
  viewTodaysResults,
  stats,
  onViewLeaderboard
}) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [glitchText, setGlitchText] = useState('!#@$%&*?');

  const handleToggleMusic = () => {
    sound.playBeep();
    const isPlaying = sound.toggleLobbyMusic();
    setIsPlayingMusic(isPlaying);
  };

  // Glitch effect for the unannounced VAR Room mode
  useEffect(() => {
    const chars = '#$@!&%*?><[]{}';
    const glitchInterval = setInterval(() => {
      let randomStr = '';
      for (let i = 0; i < 15; i++) {
        randomStr += chars[Math.floor(Math.random() * chars.length)];
      }
      setGlitchText(randomStr);
    }, 150); // Updates every 150ms for a chaotic broadcast feel
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between py-2 select-none relative">
      
      {/* Crowd Backdrop */}
      <div className="bg-[#0b1f13] border-2 border-[#1e4a2b] rounded-t p-1">
        <PixelCrowdTop excitement="medium" />
      </div>

      {/* Retro Title Logo */}
      <div className="text-center my-2 bg-[#08180e] border-2 border-[#1e4a2b] py-3 px-2 rounded shadow-inner relative">
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

        {/* 🔒 TEASER: Unannounced Upcoming Modes */}
        <div className="pt-2">
          <div className="text-center text-[6px] text-yellow-400 uppercase tracking-widest mb-1.5 font-bold">
            ⏳ ARCADE EXPANSION IN PROGRESS...
          </div>
          <div className="grid grid-cols-2 gap-2">
            
            {/* Scouting Report Teaser */}
            <div aria-disabled="true" className="bg-[#050e09] border-2 border-dashed border-[#1e4a2b] rounded p-2 text-left opacity-80 select-none flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[7px] font-black text-zinc-300 uppercase tracking-wider">
                    PROJECT: SCOUT
                  </div>
                  <div className="text-[8px]">📁</div>
                </div>
                <div className="text-[6px] font-mono text-zinc-500 tracking-wider">
                  ██████ █████ ███ ████ ███████
                </div>
              </div>
              <div className="mt-1.5 inline-block text-[6px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase w-max border border-zinc-700">
                [REDACTED]
              </div>
            </div>

            {/* VAR Room Teaser */}
            <div aria-disabled="true" className="bg-[#050e09] border-2 border-dashed border-[#1e4a2b] rounded p-2 text-left opacity-80 select-none flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[7px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="animate-pulse">🔴</span> SIGNAL LOST
                  </div>
                  <div className="text-[8px]">📺</div>
                </div>
                <div className="text-[6px] font-mono text-red-900/80 tracking-widest break-all h-3 overflow-hidden">
                  {glitchText}
                </div>
              </div>
              <div className="mt-1.5 inline-block text-[6px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase w-max border border-red-900">
                AWAITING REVIEW
              </div>
            </div>

          </div>
        </div>

        {/* 🏆 LEADERBOARD BUTTON */}
        <button
          onClick={onViewLeaderboard}
          className="w-full bg-[#0c1c2e] hover:bg-[#16304d] active:scale-95 border-2 border-blue-500/50 p-2 rounded text-center transition-all shadow-md cursor-pointer mt-1"
        >
          <span className="text-[8px] sm:text-[9px] font-black text-blue-300 uppercase tracking-wider">
            🏆 VIEW LEADERBOARDS
          </span>
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
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-black text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                  🚀 What's New
                </h2>
                <p className="text-[8px] text-gray-400 tracking-wider uppercase font-bold mt-0.5">Patch Notes History</p>
              </div>
              <button
                onClick={() => setShowWhatsNew(false)}
                className="text-zinc-400 hover:text-white text-base font-bold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Patch Notes Container */}
            <div className="space-y-5 text-xs text-zinc-300 mb-4 max-h-[50vh] overflow-y-auto pr-2">
              
              {/* Version 1.4 */}
              <div>
                <h3 className="text-[10px] text-yellow-400 tracking-wider uppercase font-bold mb-2 border-b border-zinc-800 pb-1">Version 1.4 Update</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm">🔋</span>
                    <p><strong className="text-white">Percentile Battery Bar:</strong> Added a retro battery display on the post-match screen that calculates how your daily score stacks up against the community in real time, Let us hold hands and hope it works lol.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold text-sm">📦</span>
                    <p><strong className="text-white">Massive Content Expansion:</strong> Stocked up questions across all existing modes with  bounded lists, trying to eliminate false negatives and ensuring infinite replayability.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold text-sm">⏳</span>
                    <p><strong className="text-white">Upcoming Secret Modes:</strong> Oh Jeez man, I wonder what these new gamemodes are going to be about..👀</p>
                  </div>
                </div>
              </div>

              {/* Version 1.3 */}
              <div className="opacity-80">
                <h3 className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold mb-2 border-b border-zinc-800 pb-1">Version 1.3 Update</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm">🏆</span>
                    <p><strong className="text-white">Leaderboard Overhaul:</strong> Reworked Leader board so that it now displays the top 50 players and updates automatically also made it so that you can have 10 character names. I hope it works this time.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold text-sm">🎙️</span>
                    <p><strong className="text-white">Press Conference Expansion:</strong> Updated questions, should be more diverse now and repeats should be rarer.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold text-sm">⚡</span>
                    <p><strong className="text-white">Arcade Loop:</strong> Improved the flow for quick play-again options in non-daily modes.</p>
                  </div>
                </div>
              </div>

              {/* Version 1.2 */}
              <div className="opacity-70">
                <h3 className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold mb-2 border-b border-zinc-800 pb-1">Version 1.2 Update</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold text-sm">🏆</span>
                    <p><strong className="text-white">Leaderboard Access:</strong> You can now view the global rankings straight from the Main Menu.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold text-sm">💬</span>
                    <p><strong className="text-white">Banter Refresh:</strong> Fixed repetitive quotes and added fresh disrespect for timeouts and terrible guesses.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold text-sm">🐛</span>
                    <p><strong className="text-white">Bug Fixes:</strong> Hopefully patched the leaderboard submission glitch, fixed multiple-choice autocorrect bugs-I hope it Glo's, and smoothed out game logic.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Playtest Message */}
            <div className="bg-green-950/40 border border-green-800/80 p-3 rounded text-[9px] text-green-300 mb-4 leading-relaxed text-center">
              Thank you for playing the Top Bins playtest! U so goated. If there are any queries or problems, feel free to text and let me know so I can TRY to fix them.
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
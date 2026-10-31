import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import ArcadePitch from './components/ArcadePitch';
import MainMenu from './components/MainMenu';
import { PixelStriker, PixelBall, PixelCrowdTop, PixelCrowdSide } from './components/PixelSprites';
import { sound } from './utils/audio';

export default function App() {
  const {
    gameState,
    fixtureIndex,
    totalFixtures,
    currentQuestion,
    timeLeft,
    readCountdown,
    totalTime,
    totalDistance,
    history,
    currentKickResult,
    invalidAttempt,
    stats,
    hasPlayedToday,
    shoot,
    nextFixture,
    prepareDailyMatch,
    startDailyMatch,
    goToMenu,
    viewTodaysResults
  } = useGame();

  const [inputName, setInputName] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedTierFilter, setSelectedTierFilter] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleShoot = (e) => {
    e.preventDefault();
    if (!inputName.trim() || readCountdown > 0) return;
    sound.playBeep();
    shoot(inputName);
    setInputName('');
  };

  // Wordle-Style Share Generator (Spoiler-Free & Color Coded)
  const handleShareResult = () => {
    sound.playBeep();
    
    // Circle emojis matching your UI hex colors
    const tierEmojis = {
      topBins: '🟢',       // Green
      worldie: '🔵',       // Blue
      hollywoodBall: '🟣', // Purple
      throughBall: '🟡',   // Yellow
      tapIn: '⚪',         // Slate/White
      groan: '🔴',         // Red (Blanked)
    };

    // Calculate which day/fixture this is based on your launch date
    const LAUNCH_DATE = new Date("2026-10-31T00:00:00+02:00"); 
    const diffInMs = new Date() - LAUNCH_DATE;
    let dayNumber = Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
    const fixtureNumber = dayNumber + 1; // Day 0 is Fixture 1, Day 1 is Fixture 2, etc.

    // Generate spoiler-free lines
    const lines = history.map((kick, i) => {
      const emoji = tierEmojis[kick.tierKey] || '🔴';
      const pts = `${kick.meters}m`.padStart(3, ' ');
      return `${i + 1}. ${emoji} ${pts}`;
    });

    const shareText = [
      `⚽ TOP BINS ARCADE • Fixture ${fixtureNumber}`,
      `🏆 Total Distance: ${totalDistance}m`,
      ``,
      ...lines,
      ``,
      `Play today: topbins.app`,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      });
    }
  };

  // Playtest Helper: Wipe Local Storage
  const handleResetSave = () => {
    localStorage.removeItem('topBinsSave');
    window.location.reload();
  };

  const isTimeCritical = timeLeft <= 6 && readCountdown === 0;

  return (
    <div
      onClick={() => sound.init()}
      className="min-h-[100dvh] bg-[#050b07] text-gray-100 flex flex-col justify-between items-center p-2 sm:p-4 select-none"
    >
      {/* Cabinet Frame */}
      <main className="w-full max-w-md flex-1 flex flex-col justify-between bg-[#0a180e] border-4 border-[#1e4a2b] rounded-2xl p-3 shadow-2xl">
        
        {/* Top Header HUD */}
        <header className="flex justify-between items-center border-b-2 border-[#1e4a2b] pb-2 mb-2">
          <div>
            <span className="text-[7px] text-green-400 tracking-widest uppercase block">
              {gameState === 'playing' ? `FIXTURE ${fixtureIndex + 1}/${totalFixtures}` : 'ARCADE CAB'}
            </span>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-yellow-400 uppercase drop-shadow">
              ⚽ TOP BINS
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[7px] text-gray-400 uppercase tracking-widest block">
              DISTANCE
            </span>
            <span className="text-sm font-black text-green-400 font-mono">
              {totalDistance}m
            </span>
          </div>
        </header>

        {/* 1. Main Menu */}
        {gameState === 'menu' && (
          <MainMenu 
            onStartDaily={prepareDailyMatch} 
            hasPlayedToday={hasPlayedToday}
            viewTodaysResults={viewTodaysResults}
            stats={stats}
          />
        )}

        {/* 2. Matchday Confirmation Staging Screen */}
        {gameState === 'staging' && (
          <div className="flex-1 flex flex-col justify-between py-1 select-none animate-fade-in">
            <div className="bg-[#0e2415] border-2 border-[#1e4a2b] rounded p-2 text-center mb-2">
              <span className="text-[7px] text-yellow-400 uppercase tracking-widest block mb-0.5">
                MATCHDAY CONFIRMATION
              </span>
              <h2 className="text-[9px] text-white">
                FIXTURE 1 READY • 7 ROUNDS • 20s SHOT CLOCK
              </h2>
            </div>

            <div className="relative w-full h-[320px] bg-[#0c2415] rounded-xl border-4 border-[#25613a] shadow-inner overflow-hidden flex select-none scanlines pixelated">
              <PixelCrowdSide side="left" excitement="medium" />

              <div className="relative flex-1 h-full flex flex-col justify-between overflow-hidden bg-[#143e23]">
                <div className="relative z-20 w-full bg-[#0a190e] border-b-2 border-[#1c4d2c]">
                  <PixelCrowdTop excitement="medium" />
                  <div className="w-full bg-yellow-400 text-black text-[6px] py-0.5 px-2 flex justify-between font-bold tracking-widest uppercase">
                    <span>TOP BINS ARENA</span>
                    <span>1 CREDIT READY</span>
                    <span>STAND BY</span>
                  </div>
                </div>

                <div className="relative flex-1 flex flex-col justify-end items-center pb-8 pitch-stripes">
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="mr-6">
                      <PixelStriker isKicking={false} />
                    </div>
                    <div>
                      <PixelBall size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <PixelCrowdSide side="right" excitement="medium" />
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={startDailyMatch}
                className="w-full bg-green-500 hover:bg-green-400 active:scale-95 text-black font-black py-3 rounded text-[10px] tracking-wider uppercase transition-all shadow-lg cursor-pointer animate-pulse"
              >
                KICK OFF ➔
              </button>
              <button
                type="button"
                onClick={goToMenu}
                className="w-full bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold py-2 rounded text-[7px] tracking-wider uppercase transition-all cursor-pointer"
              >
                BACK TO MENU 🏠
              </button>
            </div>
          </div>
        )}

        {/* 3. Playing Screen */}
        {gameState === 'playing' && (
          <div className="flex-1 flex flex-col justify-between">
            
            {/* LED Shot Clock */}
            <div className="mb-2 bg-[#050a07] p-1.5 rounded border border-[#1e4a2b] shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center text-[7px] sm:text-[8px] tracking-widest mb-1 font-mono px-1">
                <span className={isTimeCritical ? 'text-red-500 animate-pulse font-black drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]' : 'text-green-400 font-bold'}>
                  {readCountdown > 0 ? `PREVIEWING (${readCountdown}s)` : `SHOT CLOCK: ${timeLeft}s`}
                </span>
                <span className="text-gray-600 font-bold">NO CHEATS</span>
              </div>
              <div className="w-full bg-[#0a180e] rounded h-2.5 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-1000 ease-linear flex justify-end ${
                    readCountdown > 0
                      ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                      : isTimeCritical
                      ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                      : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                  }`}
                  style={{
                    width: readCountdown > 0 ? '100%' : `${(timeLeft / totalTime) * 100}%`,
                  }}
                >
                  <div className="w-1 h-full bg-white/40" />
                </div>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#0a180e_2px,#0a180e_4px)] opacity-50 pointer-events-none" />
              </div>
            </div>

            {/* Question Screen */}
            <div className="bg-[#0e2415] border-2 border-[#1e4a2b] rounded p-2 text-center mb-2 shadow-inner">
              <span className="text-[7px] text-emerald-400 uppercase tracking-widest block mb-1">
                {currentQuestion.title}
              </span>
              <h2 className="text-[9px] sm:text-[10px] text-white leading-relaxed">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Dynamic Pitch with Suspense Engine */}
            <ArcadePitch
              currentKickResult={currentKickResult}
              nextFixture={nextFixture}
              readCountdown={readCountdown}
            />

            {/* Invalid Guess Alert */}
            <div className="h-6 flex items-center justify-center my-1">
              {invalidAttempt && (
                <div className="bg-red-950 border border-red-600 px-3 py-1 rounded text-center animate-shake">
                  <span className="text-[7px] text-red-400 tracking-wider uppercase font-bold">
                    ⚠️ {invalidAttempt.reason} TRY AGAIN!
                  </span>
                </div>
              )}
            </div>

            {/* Retro Terminal Input Form */}
            <form onSubmit={handleShoot} className="flex gap-2 mt-auto">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-green-500 text-[10px] font-mono animate-pulse">
                  {">"}
                </span>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={readCountdown > 0 ? 'READING...' : "ENTER PLAYER..."}
                  disabled={Boolean(currentKickResult) || readCountdown > 0}
                  autoFocus
                  className="w-full bg-[#050b07] border-2 border-[#1e4a2b] focus:border-green-400 focus:shadow-[0_0_12px_rgba(34,197,94,0.2)] rounded pl-6 pr-2 py-2 text-[9px] sm:text-[10px] text-green-400 placeholder-green-900/60 outline-none uppercase font-mono tracking-widest disabled:opacity-50 transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={Boolean(currentKickResult) || !inputName.trim() || readCountdown > 0}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 active:border-b-0 active:translate-y-[4px] border-b-4 border-red-800 disabled:bg-gray-800 disabled:border-gray-900 disabled:text-gray-600 text-white font-black px-4 rounded text-[9px] sm:text-[10px] tracking-widest uppercase transition-all cursor-pointer flex-shrink-0"
              >
                STRIKE ⚽
              </button>
            </form>
          </div>
        )}

        {/* 4. Post-Match Debrief Screen */}
        {gameState === 'finished' && (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="text-center pb-2 border-b-2 border-[#1e4a2b]">
              <div className="text-3xl mb-1">🏆</div>
              <h2 className="text-base font-black text-yellow-400 tracking-wider uppercase">
                FULL TIME!
              </h2>
              <div className="mt-1 text-xl font-mono font-black text-green-400">
                {totalDistance}m
              </div>
            </div>

            {/* Fixtures Accordion */}
            <div className="flex-1 overflow-y-auto max-h-[250px] my-2 space-y-2 pr-1">
              {history.map((kick, idx) => {
                const currentFilter = selectedTierFilter[idx] || 'ALL';
                const filteredAnswers = (kick.allAnswers || []).filter((ans) => {
                  if (currentFilter === 'ALL') return true;
                  return ans.tierKey === currentFilter;
                });

                return (
                  <div
                    key={idx}
                    className="bg-[#0e2415] border-2 border-[#1e4a2b] rounded p-2.5 transition-all"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => {
                        sound.playBeep();
                        setExpandedIndex(expandedIndex === idx ? null : idx);
                      }}
                    >
                      <div>
                        <span className="text-[7px] text-gray-500 block uppercase">
                          Fixture {idx + 1}
                        </span>
                        <span className="text-[9px] text-white font-bold">
                          {kick.player?.name || 'BLANKED (0s)'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[9px] font-mono font-black block"
                          style={{ color: kick.tierColor }}
                        >
                          +{kick.meters}m
                        </span>
                        <span className="text-[7px] text-gray-400 uppercase">
                          {kick.tierName} {expandedIndex === idx ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {expandedIndex === idx && (
                      <div className="mt-2.5 pt-2 border-t border-[#1e4a2b] text-[8px]">
                        <div className="text-gray-300 mb-2">
                          <span className="text-yellow-400">Question: </span>
                          {kick.question.prompt}
                        </div>

                        {/* Filter Dropdown */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <label className="text-[7px] text-gray-400 uppercase">Filter Tier:</label>
                          <select
                            value={currentFilter}
                            onChange={(e) => {
                              sound.playBeep();
                              setSelectedTierFilter((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }));
                            }}
                            className="bg-black/70 border border-[#2b6d43] text-white text-[7px] p-1 rounded font-mono outline-none cursor-pointer"
                          >
                            <option value="ALL">ALL ANSWERS ({kick.allAnswers?.length || 0})</option>
                            <option value="topBins">🔥 TOP BINS (81-100m)</option>
                            <option value="worldie">⚡ WORLDIE (61-80m)</option>
                            <option value="hollywoodBall">🎯 HOLLYWOOD (41-60m)</option>
                            <option value="throughBall">👟 THROUGH BALL (21-40m)</option>
                            <option value="tapIn">🥱 TAP-IN (1-20m)</option>
                          </select>
                        </div>

                        {/* Player List */}
                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 bg-black/40 p-1.5 rounded border border-[#1e4a2b]">
                          {filteredAnswers.length > 0 ? (
                            filteredAnswers.map((ans) => (
                              <div
                                key={ans.id}
                                className="flex justify-between items-center py-0.5 border-b border-gray-800/60 last:border-0"
                              >
                                <span className="text-gray-200 text-[8px]">
                                  {ans.name}
                                </span>
                                <span
                                  className="font-mono font-bold text-[8px]"
                                  style={{ color: ans.tierColor }}
                                >
                                  +{ans.meters}m
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[7px] text-gray-500 py-1 text-center">
                              No players found in this tier.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-2">
              <button
                onClick={handleShareResult}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black py-2.5 rounded text-[8px] sm:text-[9px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{copyFeedback ? 'COPIED TO CLIPBOARD! ✅' : 'SHARE MATCHDAY RESULT 📋'}</span>
              </button>

              {/* Playtest Bypass Button */}
              <button
                onClick={prepareDailyMatch}
                className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black py-2 rounded text-[7px] tracking-wider uppercase transition-all shadow-md cursor-pointer border border-purple-400"
              >
                PLAYTEST: PLAY AGAIN 🔄
              </button>
              
              <button
                onClick={goToMenu}
                className="w-full bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-200 font-bold py-2 rounded text-[7px] tracking-wider uppercase transition-all cursor-pointer"
              >
                MAIN MENU 🏠
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-[7px] text-gray-600 mt-2 flex flex-col items-center gap-2 uppercase tracking-widest">
        <span>TOP BINS • RETRO FOOTBALL ARCADE</span>
        {/* Playtest Reset Save Button */}
        <button 
          onClick={handleResetSave}
          className="text-red-500 border border-red-900 bg-red-950/30 px-2 py-1 rounded hover:bg-red-900/50 transition-colors"
        >
          [DEV] Reset Save Data
        </button>
      </footer>
    </div>
  );
}
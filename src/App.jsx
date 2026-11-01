import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import ArcadePitch from './components/ArcadePitch';
import PressConference from './components/PressConference';
import MainMenu from './components/MainMenu';
import HowToPlayModal from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PixelStriker, PixelBall, PixelCrowdTop, PixelCrowdSide } from './components/PixelSprites';
import { sound } from './utils/audio';

export default function App() {
  const {
    gameState,
    gameMode,
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
    pendingAutocorrect,
    strikes,
    varAvailable,
    cardEvent,
    triggerVarChallenge,
    reportMissingPostMatch,
    stats,
    hasPlayedToday,
    shoot,
    cancelAutocorrect,
    nextFixture,
    prepareDailyMatch,
    prepareCardsMatch,
    prepareEndlessMatch,
    startDailyMatch,
    goToMenu,
    viewTodaysResults
  } = useGame();

  const [inputName, setInputName] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedTierFilter, setSelectedTierFilter] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [reportedIndices, setReportedIndices] = useState({});
  
  // Modal states
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('endless');

  const isInputLocked = Boolean(currentKickResult) || readCountdown > 0 || Boolean(cardEvent);
  const hasOptions = gameMode === 'endless' && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0;

  const handleShoot = (e) => {
    e.preventDefault();
    if (pendingAutocorrect) {
      sound.playBeep();
      shoot(pendingAutocorrect.rawInput, true);
      setInputName('');
      return;
    }

    if (!inputName.trim() || isInputLocked || hasOptions) return;
    sound.playBeep();
    shoot(inputName);
    setInputName('');
  };

  const handleShareResult = () => {
    sound.playBeep();
    
    const tierEmojis = {
      topBins: '🟢',
      worldie: '🔵',
      hollywoodBall: '🟣',
      throughBall: '🟡',
      tapIn: '⚪',
      groan: '🔴',
    };

    const LAUNCH_DATE = new Date("2026-10-31T00:00:00+02:00"); 
    const diffInMs = new Date() - LAUNCH_DATE;
    let dayNumber = Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
    const fixtureNumber = dayNumber + 1;

    const lines = history.map((kick, i) => {
      const emoji = tierEmojis[kick.tierKey] || '🔴';
      const pts = gameMode === 'endless' ? `${kick.meters}pts`.padStart(6, ' ') : `${kick.meters}m`.padStart(3, ' ');
      return `${i + 1}. ${emoji} ${pts}`;
    });

    const modeTitle =
      gameMode === 'cards'
        ? '2-Card Sudden Death'
        : gameMode === 'endless'
        ? 'Press Conference (Endless)'
        : `Fixture ${fixtureNumber}`;

    const scoreTitle = gameMode === 'endless' ? `Approval Score: ${totalDistance} PTS` : `Total Distance: ${totalDistance}m`;

    const shareText = [
      `⚽ TOP BINS ARCADE • ${modeTitle}`,
      `🏆 ${scoreTitle}`,
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

  const handleResetSave = () => {
    localStorage.removeItem('topBinsSave');
    window.location.reload();
  };

  const isTimeCritical = timeLeft <= 6 && readCountdown === 0;
  const isEndless = gameMode === 'endless';

  return (
    <div
      onClick={() => sound.init()}
      className={`min-h-[100dvh] ${isEndless ? 'bg-[#04080e]' : 'bg-[#050b07]'} text-gray-100 flex flex-col justify-between items-center p-2 sm:p-4 select-none transition-colors duration-500`}
    >
      {/* Cabinet Frame */}
      <main className={`w-full max-w-md flex-1 flex flex-col justify-between ${isEndless ? 'bg-[#091320] border-4 border-[#243b55]' : 'bg-[#0a180e] border-4 border-[#1e4a2b]'} rounded-2xl p-3 shadow-2xl transition-colors duration-500`}>
        
        {/* Top Header HUD */}
        <header className={`flex justify-between items-center border-b-2 ${isEndless ? 'border-[#243b55]' : 'border-[#1e4a2b]'} pb-2 mb-2`}>
          <div>
            <span className={`text-[7px] ${isEndless ? 'text-blue-400' : 'text-green-400'} tracking-widest uppercase block`}>
              {gameState === 'playing'
                ? gameMode === 'daily'
                  ? `FIXTURE ${fixtureIndex + 1}/${totalFixtures}`
                  : `ROUND ${fixtureIndex + 1}`
                : 'ARCADE CAB'}
            </span>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-yellow-400 uppercase drop-shadow">
              ⚽ TOP BINS
            </h1>
          </div>

          <div className="text-right flex items-center gap-2">
            <div>
              <span className="text-[7px] text-gray-400 uppercase tracking-widest block">
                {isEndless ? 'APPROVAL' : 'DISTANCE'}
              </span>
              <span className={`text-sm font-black ${isEndless ? 'text-blue-400' : 'text-green-400'} font-mono`}>
                {isEndless ? `${totalDistance} PTS` : `${totalDistance}m`}
              </span>
            </div>
          </div>
        </header>

        {/* 1. Main Menu */}
        {gameState === 'menu' && (
          <MainMenu 
            onStartDaily={prepareDailyMatch}
            onStartCards={prepareCardsMatch}
            onStartEndless={prepareEndlessMatch}
            hasPlayedToday={hasPlayedToday}
            viewTodaysResults={viewTodaysResults}
            stats={stats}
          />
        )}

        {/* 2. Mode Confirmation & Rules Staging Screen */}
        {gameState === 'staging' && (
          <div className="flex-1 flex flex-col justify-between py-1 select-none animate-fade-in">
            <div className={`${isEndless ? 'bg-[#102238] border-[#243b55]' : 'bg-[#0e2415] border-[#1e4a2b]'} border-2 rounded p-2 text-center mb-2`}>
              <span className="text-[7px] text-yellow-400 uppercase tracking-widest block mb-0.5">
                {gameMode === 'daily' && 'MATCHDAY CONFIRMATION'}
                {gameMode === 'cards' && '🟨🟥 2-CARD SUDDEN DEATH'}
                {gameMode === 'endless' && '🎙️ PRESS CONFERENCE SURVIVAL'}
              </span>
              <h2 className="text-[9px] text-white">
                {gameMode === 'daily' && 'FIXTURE 1 READY • 7 ROUNDS • 20s SHOT CLOCK'}
                {gameMode === 'cards' && '3 STRIKES & YOU ARE SENT OFF • 1 VAR LIFELINE'}
                {gameMode === 'endless' && 'SHRINKING TIMER • 15 PTS PER ANSWER • SURVIVE'}
              </h2>
            </div>

            {/* Mode Preview Screen */}
            {isEndless ? (
              <div className="relative w-full h-[320px] bg-[#0c1624] rounded-xl border-4 border-[#243b55] shadow-inner overflow-hidden flex flex-col justify-between p-3 select-none scanlines pixelated">
                <div className="flex justify-between items-center bg-[#060b12] border border-[#243b55] rounded px-3 py-1 text-[7px] text-gray-300">
                  <span className="text-red-500 font-bold">🔴 PRESS ROOM STAGING</span>
                  <button 
                    onClick={() => {
                      sound.playBeep();
                      setShowHowToPlay(true);
                    }}
                    className="relative z-50 pointer-events-auto bg-[#102238] text-yellow-400 px-1.5 py-0.5 rounded animate-pulse cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700 font-bold uppercase"
                  >
                    HOW TO PLAY [?]
                  </button>
                </div>
                
                <div className="relative flex-1 flex flex-col items-center justify-center bg-[#102238] rounded border border-[#1b3656] my-2 p-3 text-center">
                  <div className="text-3xl mb-2">🎙️</div>
                  <h3 className="text-yellow-400 text-[10px] font-black uppercase tracking-wider mb-1">PRESS CONFERENCE MODE</h3>
                  <p className="text-gray-300 text-[8px] leading-relaxed max-w-[260px]">
                    You are in the hot seat. Answer rapid-fire football trivia into the studio microphones before the shrinking clock runs out!
                  </p>
                </div>

                <div className="bg-[#060b12] border border-[#243b55] rounded p-2 text-center text-[7px] text-gray-400">
                  PRESS KICK OFF TO FACE THE REPORTERS
                </div>
              </div>
            ) : (
              <div className="relative w-full h-[320px] bg-[#0c2415] rounded-xl border-4 border-[#25613a] shadow-inner overflow-hidden flex select-none scanlines pixelated">
                <PixelCrowdSide side="left" excitement="medium" />

                <div className="relative flex-1 h-full flex flex-col justify-between overflow-hidden bg-[#143e23]">
                  <div className="relative z-20 w-full bg-[#0a190e] border-b-2 border-[#1c4d2c]">
                    <PixelCrowdTop excitement="medium" />
                    <div className="w-full bg-yellow-400 text-black text-[6px] py-0.5 px-2 flex justify-between items-center font-bold tracking-widest uppercase">
                      <span>TOP BINS ARENA</span>
                      <span>1 CREDIT READY</span>
                      <button 
                        onClick={() => {
                          sound.playBeep();
                          setShowHowToPlay(true);
                        }}
                        className="relative z-50 pointer-events-auto bg-black text-yellow-400 px-1.5 py-0.5 rounded animate-pulse cursor-pointer hover:bg-gray-900 transition-colors"
                      >
                        HOW TO PLAY [?]
                      </button>
                    </div>
                  </div>

                  {gameMode === 'cards' && (
                    <div className="relative z-20 mx-2 my-auto bg-black/85 border-2 border-yellow-400/80 rounded-lg p-2.5 text-[7px] text-gray-200 space-y-1.5 shadow-xl">
                      <div className="text-yellow-400 font-black text-[8px] uppercase tracking-wider text-center border-b border-gray-800 pb-1">
                        📋 REFEREE RULEBOOK
                      </div>
                      <p>1️⃣ <strong className="text-orange-400">1st Miss:</strong> Ref blows whistle for a formal Warning.</p>
                      <p>2️⃣ <strong className="text-yellow-300">2nd Miss:</strong> Booked with a Yellow Card 🟨.</p>
                      <p>3️⃣ <strong className="text-red-400">3rd Miss:</strong> 2nd Yellow turns Red 🟥 — Game Over!</p>
                      <p>📺 <strong className="text-blue-400">VAR Check:</strong> 1 per match. Contest a card to overturn it!</p>
                    </div>
                  )}

                  <div className="relative flex-1 flex flex-col justify-end items-center pb-6 pitch-stripes">
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
            )}

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
            <div className={`mb-2 ${isEndless ? 'bg-[#04080e] border-[#243b55]' : 'bg-[#050a07] border-[#1e4a2b]'} p-1.5 rounded border shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]`}>
              <div className="flex justify-between items-center text-[7px] sm:text-[8px] tracking-widest mb-1 font-mono px-1">
                <span className={isTimeCritical ? 'text-red-500 animate-pulse font-black drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]' : isEndless ? 'text-blue-400 font-bold' : 'text-green-400 font-bold'}>
                  {readCountdown > 0 ? `PREVIEWING (${readCountdown}s)` : `SHOT CLOCK: ${timeLeft}s`}
                </span>
                <span className="text-gray-500 font-bold">
                  {gameMode === 'cards' ? 'SUDDEN DEATH' : isEndless ? `HOT SEAT (${totalTime}s)` : 'NO CHEATS'}
                </span>
              </div>
              <div className={`w-full ${isEndless ? 'bg-[#091320]' : 'bg-[#0a180e]'} rounded h-2.5 overflow-hidden relative`}>
                <div
                  className={`h-full transition-all duration-1000 ease-linear flex justify-end ${
                    readCountdown > 0
                      ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                      : isTimeCritical
                      ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                      : isEndless
                      ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
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
            <div className={`${isEndless ? 'bg-[#102238] border-[#243b55]' : 'bg-[#0e2415] border-[#1e4a2b]'} border-2 rounded p-2 text-center mb-2 shadow-inner`}>
              <span className={`text-[7px] ${isEndless ? 'text-blue-300' : 'text-emerald-400'} uppercase tracking-widest block mb-1`}>
                {currentQuestion.title}
              </span>
              <h2 className="text-[9px] sm:text-[10px] text-white leading-relaxed">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Multiple Choice Option Buttons for Daily/Cards */}
            {!isEndless && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isInputLocked}
                    onClick={() => {
                      sound.playBeep();
                      shoot(opt);
                    }}
                    className="bg-[#0b1f13] hover:bg-[#153522] active:scale-95 border border-[#1e4a2b] hover:border-yellow-400/80 text-yellow-300 font-mono text-[8px] sm:text-[9px] p-2 rounded uppercase tracking-wider transition-all shadow cursor-pointer disabled:opacity-50"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Dynamic Arena */}
            {isEndless ? (
              <PressConference
                currentQuestion={currentQuestion}
                isInputLocked={isInputLocked}
                shoot={shoot}
                timeLeft={timeLeft}
                totalTime={totalTime}
                readCountdown={readCountdown}
                currentKickResult={currentKickResult}
              />
            ) : (
              <ArcadePitch
                currentKickResult={currentKickResult}
                nextFixture={nextFixture}
                readCountdown={readCountdown}
                gameMode={gameMode}
                strikes={strikes}
                varAvailable={varAvailable}
                cardEvent={cardEvent}
                onTriggerVar={triggerVarChallenge}
              />
            )}

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

            {/* Autocorrect Confirmation Banner */}
            {pendingAutocorrect && (
              <div className="bg-blue-950 border-2 border-blue-400 p-2 rounded mb-2 text-center animate-bounce shadow-xl">
                <span className="text-[7px] text-blue-300 block uppercase tracking-wider mb-1 font-bold">
                  🔍 DID YOU MEAN THIS PLAYER?
                </span>
                <div className="text-[10px] text-yellow-300 font-black tracking-wide uppercase mb-2">
                  {pendingAutocorrect.matchedAnswer.name}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => shoot(pendingAutocorrect.rawInput, true)}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-black font-black py-1.5 rounded text-[8px] uppercase tracking-wider cursor-pointer"
                  >
                    CONFIRM [ENTER] ✅
                  </button>
                  <button
                    type="button"
                    onClick={cancelAutocorrect}
                    className="flex-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-600 font-bold py-1.5 rounded text-[8px] uppercase tracking-wider cursor-pointer"
                  >
                    CANCEL [ESC] ❌
                  </button>
                </div>
              </div>
            )}

            {/* Retro Terminal Input Form */}
            {!hasOptions && (
              <form onSubmit={handleShoot} className="flex gap-2 mt-auto">
                <div className="relative flex-1">
                  <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isEndless ? 'text-blue-400' : 'text-green-500'} text-[10px] font-mono animate-pulse`}>
                    {">"}
                  </span>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder={readCountdown > 0 ? 'READING...' : cardEvent ? 'REFEREE RULING...' : isEndless ? "SPEAK INTO MIC..." : "ENTER PLAYER..."}
                    disabled={isInputLocked}
                    autoFocus
                    className={`w-full ${isEndless ? 'bg-[#04080e] border-[#243b55] text-blue-300 placeholder-blue-900/60 focus:border-blue-400 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)]' : 'bg-[#050b07] border-[#1e4a2b] text-green-400 placeholder-green-900/60 focus:border-green-400 focus:shadow-[0_0_12px_rgba(34,197,94,0.2)]'} border-2 rounded pl-6 pr-2 py-2 text-[9px] sm:text-[10px] outline-none uppercase font-mono tracking-widest disabled:opacity-50 transition-all`}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isInputLocked || (!inputName.trim() && !pendingAutocorrect)}
                  className="bg-red-600 hover:bg-red-500 active:bg-red-700 active:border-b-0 active:translate-y-[4px] border-b-4 border-red-800 disabled:bg-gray-800 disabled:border-gray-900 disabled:text-gray-600 text-white font-black px-4 rounded text-[9px] sm:text-[10px] tracking-widest uppercase transition-all cursor-pointer flex-shrink-0"
                >
                  {isEndless ? 'ANSWER 🎙️' : 'STRIKE ⚽'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 4. Post-Match Debrief Screen */}
        {gameState === 'finished' && (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className={`text-center pb-2 border-b-2 ${isEndless ? 'border-[#243b55]' : 'border-[#1e4a2b]'}`}>
              <div className="text-3xl mb-1">{gameMode === 'cards' && strikes >= 3 ? '🟥' : isEndless ? '🎙️' : '🏆'}</div>
              <h2 className="text-base font-black text-yellow-400 tracking-wider uppercase">
                {gameMode === 'cards' && strikes >= 3 ? 'SENT OFF! GAME OVER' : isEndless ? 'PRESS CONFERENCE CONCLUDED' : 'FULL TIME!'}
              </h2>
              <div className={`mt-1 text-xl font-mono font-black ${isEndless ? 'text-blue-400' : 'text-green-400'}`}>
                {isEndless ? `${totalDistance} PTS` : `${totalDistance}m`}
              </div>
            </div>

            {/* Fixtures Accordion */}
            <div className="flex-1 overflow-y-auto max-h-[200px] my-2 space-y-2 pr-1">
              {history.map((kick, idx) => {
                const currentFilter = selectedTierFilter[idx] || 'ALL';
                const filteredAnswers = (kick.allAnswers || []).filter((ans) => {
                  if (currentFilter === 'ALL') return true;
                  return ans.tierKey === currentFilter;
                });

                return (
                  <div
                    key={idx}
                    className={`${isEndless ? 'bg-[#102238] border-[#243b55]' : 'bg-[#0e2415] border-[#1e4a2b]'} border-2 rounded p-2.5 transition-all`}
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
                          Round {idx + 1}
                        </span>
                        <span className="text-[9px] text-white font-bold">
                          {kick.player?.name || 'SACKED (0s)'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[9px] font-mono font-black block"
                          style={{ color: kick.tierColor }}
                        >
                          +{kick.meters} {isEndless ? 'pts' : 'm'}
                        </span>
                        <span className="text-[7px] text-gray-400 uppercase">
                          {kick.tierName} {expandedIndex === idx ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {expandedIndex === idx && (
                      <div className={`mt-2.5 pt-2 border-t ${isEndless ? 'border-[#243b55]' : 'border-[#1e4a2b]'} text-[8px]`}>
                        <div className="text-gray-300 mb-2">
                          <span className="text-yellow-400">Question: </span>
                          {kick.question.prompt}
                        </div>

                        <div className="mb-2 flex justify-between items-center bg-black/50 p-1.5 rounded border border-zinc-800">
                          <span className="text-[6px] text-gray-400 uppercase">
                            Think your answer was valid?
                          </span>
                          <button
                            type="button"
                            disabled={Boolean(reportedIndices[idx])}
                            onClick={() => {
                              reportMissingPostMatch(kick.question.prompt, kick.player?.name);
                              setReportedIndices((prev) => ({ ...prev, [idx]: true }));
                            }}
                            className={`text-[6px] font-bold px-2 py-0.5 rounded uppercase cursor-pointer ${
                              reportedIndices[idx]
                                ? 'bg-emerald-900 text-emerald-300'
                                : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-700'
                            }`}
                          >
                            {reportedIndices[idx] ? 'LOGGED FOR REVIEW ✅' : '🚩 REPORT MISSING ANSWER'}
                          </button>
                        </div>

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

                        <div className={`space-y-1 max-h-[140px] overflow-y-auto pr-1 bg-black/40 p-1.5 rounded border ${isEndless ? 'border-[#243b55]' : 'border-[#1e4a2b]'}`}>
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
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black py-2 rounded text-[8px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{copyFeedback ? 'COPIED TO CLIPBOARD! ✅' : 'SHARE MATCH RESULT 📋'}</span>
              </button>

              {(gameMode === 'endless' || gameMode === 'cards') && totalDistance > 0 && (
                <button
                  onClick={() => {
                    sound.playBeep();
                    setLeaderboardTab(gameMode);
                    setShowLeaderboard(true);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black py-2 rounded text-[8px] tracking-wider uppercase transition-all shadow-md cursor-pointer border border-yellow-300"
                >
                  🏆 SUBMIT / VIEW LEADERBOARD
                </button>
              )}

              <button
                onClick={
                  gameMode === 'cards'
                    ? prepareCardsMatch
                    : gameMode === 'endless'
                    ? prepareEndlessMatch
                    : prepareDailyMatch
                }
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

      {/* Global Leaderboard Modal Popup */}
      {showLeaderboard && (
        <LeaderboardModal 
          finalScore={totalDistance} 
          gameMode={leaderboardTab} 
          onClose={() => setShowLeaderboard(false)} 
        />
      )}

      {/* How To Play Modal Popup - NOW RECEIVING gameMode! */}
      {showHowToPlay && (
        <HowToPlayModal gameMode={gameMode} onClose={() => setShowHowToPlay(false)} />
      )}

      <footer className="text-[7px] text-gray-600 mt-2 flex flex-col items-center gap-2 uppercase tracking-widest">
        <span>TOP BINS • RETRO FOOTBALL ARCADE</span>
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
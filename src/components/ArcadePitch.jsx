import React, { useState, useEffect } from 'react';
import { PixelStriker, PixelReferee, PixelBall, PixelCrowdTop, PixelCrowdSide } from './PixelSprites';
import { sound } from '../utils/audio';

export default function ArcadePitch({
  currentKickResult,
  nextFixture,
  readCountdown,
  gameMode = 'daily',
  strikes = 0,
  varAvailable = true,
  cardEvent = null,
  onTriggerVar
}) {
  const [flightPhase, setFlightPhase] = useState('idle');
  const [rollingMeters, setRollingMeters] = useState(0);

  useEffect(() => {
    if (!currentKickResult) {
      setFlightPhase('idle');
      setRollingMeters(0);
      return;
    }

    if (currentKickResult.type === 'timeout') {
      setFlightPhase('revealed');
      sound.playCrowdRoar('groan');
      sound.playWhistle();
      return;
    }

    setFlightPhase('flying');
    sound.playKick();

    const targetMeters = currentKickResult.meters || 0;
    let startTimestamp = null;
    const duration = 2500; 

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setRollingMeters(Math.floor(easeOut * targetMeters));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);

    const flightTimer = setTimeout(() => {
      setFlightPhase('revealed');
      const isTopBins = currentKickResult.meters >= 81;

      sound.playCrowdRoar(currentKickResult.tierKey || 'tapIn');
      sound.playChime(isTopBins);
    }, 2800);

    return () => clearTimeout(flightTimer);
  }, [currentKickResult]);

  const meters = currentKickResult?.meters || 0;
  const isTopBins = meters >= 81;
  const crowdExcitement = flightPhase === 'revealed' ? (isTopBins ? 'topBins' : meters >= 61 ? 'high' : 'low') : 'low';

  let ballY = 0;
  let ballScale = 1;
  let ballShadowScale = 0.8;

  if (flightPhase === 'flying' || flightPhase === 'revealed') {
    ballY = -(meters * 3.45);
    ballScale = isTopBins ? 1.5 : meters > 40 ? 1.3 : 1.1;
    ballShadowScale = isTopBins ? 0.3 : 0.6;
  }

  const isShaking = flightPhase === 'revealed' && isTopBins;
  const cameraTransform = flightPhase === 'idle'
    ? 'scale(1.25) translateY(20px)'
    : 'scale(1) translateY(0px)';

  return (
    <div className={`relative w-full h-[380px] sm:h-[420px] bg-[#0c2415] rounded-xl border-4 border-[#25613a] shadow-2xl overflow-hidden flex select-none scanlines pixelated ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
      
      <PixelCrowdSide side="left" excitement={crowdExcitement} />

      <div className="relative flex-1 h-full overflow-hidden bg-[#143e23] flex flex-col justify-between">
        
        <div className="relative z-20 w-full bg-[#0a190e] border-b-2 border-[#1c4d2c]">
          <PixelCrowdTop excitement={crowdExcitement} />
          <div className="w-full bg-yellow-400 text-black text-[6px] py-0.5 px-2 flex justify-between font-bold tracking-widest uppercase">
            <span>TOP BINS 2D</span>
            <span>{gameMode === 'cards' ? 'SUDDEN DEATH ARENA' : 'MATCHDAY ARENA'}</span>
            <span>1 CREDIT</span>
          </div>
        </div>

        {gameMode === 'cards' && (
          <div className="absolute top-12 right-2 z-30 flex items-center gap-1.5 bg-black/80 border border-[#1e4a2b] px-2 py-1 rounded shadow-md">
            <div
              className={`text-[6px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 ${
                varAvailable
                  ? 'bg-blue-950/90 text-sky-300 border-sky-400'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-700'
              }`}
            >
              <span>📺</span>
              <span>{varAvailable ? 'VAR READY' : 'VAR USED'}</span>
            </div>

            <div className="flex items-center gap-1 pl-1 border-l border-zinc-700">
              <div
                title="Warning"
                className={`w-3 h-4 rounded-[1px] border flex items-center justify-center text-[6px] font-black transition-all ${
                  strikes >= 1
                    ? 'bg-orange-500 border-orange-200 text-black shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                    : 'bg-zinc-900/80 border-zinc-700 text-zinc-600'
                }`}
              >
                !
              </div>
              <div
                title="Yellow Card"
                className={`w-3 h-4 rounded-[1px] border transition-all ${
                  strikes >= 2
                    ? 'bg-yellow-400 border-yellow-100 shadow-[0_0_6px_rgba(250,204,21,0.9)]'
                    : 'bg-zinc-900/80 border-zinc-700'
                }`}
              />
              <div
                title="Red Card"
                className={`w-3 h-4 rounded-[1px] border transition-all ${
                  strikes >= 3
                    ? 'bg-red-600 border-red-200 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                    : 'bg-zinc-900/80 border-zinc-700'
                }`}
              />
            </div>
          </div>
        )}

        <div
          className="relative flex-1 flex flex-col justify-between transition-transform duration-[1400ms] ease-out origin-bottom"
          style={{ transform: cameraTransform }}
        >
          <div className="relative z-10 w-full flex flex-col items-center pt-2">
            <div className="w-48 h-9 border-2 border-white/90 border-b-0 bg-white/20 rounded-t flex items-center justify-center backdrop-blur-xs shadow-inner">
              <span className={`text-[8px] font-mono font-black tracking-widest text-yellow-300 drop-shadow transition-opacity duration-700 ${flightPhase === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
                🥅 100m • TOP BINS
              </span>
            </div>
            <div className="w-60 h-7 border-2 border-white/35 border-t-0" />
          </div>

          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${flightPhase === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-purple-400/40 flex justify-between px-2 text-[6px] text-purple-300">
              <span>80m</span>
              <span>WORLDIE</span>
              <span>80m</span>
            </div>
            <div className="absolute inset-x-0 top-[38%] border-t border-dashed border-red-400/40 flex justify-between px-2 text-[6px] text-red-300">
              <span>60m</span>
              <span>HOLLYWOOD BALL</span>
              <span>60m</span>
            </div>
            <div className="absolute inset-x-0 top-[56%] border-t border-dashed border-sky-400/40 flex justify-between px-2 text-[6px] text-sky-300">
              <span>40m</span>
              <span>THROUGH BALL</span>
              <span>40m</span>
            </div>
            <div className="absolute inset-x-0 top-[74%] border-t border-dashed border-gray-400/40 flex justify-between px-2 text-[6px] text-gray-300">
              <span>20m</span>
              <span>TAP-IN</span>
              <span>20m</span>
            </div>
          </div>

          <div className="absolute inset-0 pitch-stripes opacity-40 pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col items-center pb-6">
            <div className="w-full flex justify-center items-center relative">
              <div className="absolute bottom-3 left-[54%] -translate-x-1/2 w-2 h-2 bg-white/70 rounded-full" />

              <div className="absolute bottom-2 left-[36%] -translate-x-1/2">
                <PixelStriker isKicking={flightPhase !== 'idle'} />
              </div>

              <div
                className={`absolute bottom-3 left-[54%] -translate-x-1/2 flex flex-col items-center z-20 ${
                  flightPhase === 'flying'
                    ? 'transition-all duration-[2800ms] cubic-bezier(0.22, 1, 0.36, 1)'
                    : flightPhase === 'revealed'
                    ? 'transition-all duration-300'
                    : ''
                }`}
                style={{
                  transform: `translate(-50%, ${ballY}px)`,
                }}
              >
                {flightPhase !== 'idle' && currentKickResult?.player?.name && (
                  <div className="absolute -top-7 whitespace-nowrap z-30 pointer-events-none animate-bounce">
                    <div className="bg-black/85 border border-yellow-400/90 text-yellow-300 text-[6px] sm:text-[7px] font-mono font-black px-2 py-0.5 rounded shadow-lg tracking-wider uppercase flex items-center gap-1 backdrop-blur-xs">
                      <span>⚽</span>
                      <span>{currentKickResult.player.name}</span>
                    </div>
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-yellow-400/90 mx-auto" />
                  </div>
                )}

                <div
                  className="absolute -bottom-1 w-3 h-1 bg-black/60 rounded-full transition-transform duration-300"
                  style={{ transform: `scale(${ballShadowScale})` }}
                />

                <div
                  className="transition-transform duration-700"
                  style={{ transform: `scale(${ballScale})` }}
                >
                  <PixelBall size={17} />
                </div>

                {flightPhase === 'flying' && (
                  <div className="absolute -bottom-2 w-4 h-2 bg-white/50 rounded-full animate-ping opacity-60" />
                )}

                {flightPhase === 'revealed' && currentKickResult?.type === 'hit' && (
                  <div
                    className="absolute -inset-2 rounded-full animate-ping opacity-80"
                    style={{ backgroundColor: currentKickResult.tierColor }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {readCountdown > 0 && flightPhase === 'idle' && !cardEvent && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="bg-[#0b1d11] border-2 border-yellow-400 px-5 py-3 rounded text-center shadow-2xl">
              <span className="text-[7px] text-yellow-300 uppercase tracking-widest block mb-1">
                READ QUESTION
              </span>
              <div className="text-xl font-black text-white font-mono animate-pulse">
                {readCountdown}s
              </div>
            </div>
          </div>
        )}

        {cardEvent && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs p-3 animate-fade-in pointer-events-auto">
            
            {(cardEvent.phase === 'warning' ||
              cardEvent.phase === 'yellow' ||
              cardEvent.phase === 'secondYellow' ||
              cardEvent.phase === 'red') && (
              <div
                className={`w-full max-w-[280px] bg-zinc-950 border-4 rounded-xl p-3 text-center shadow-2xl flex flex-col items-center ${
                  cardEvent.phase === 'warning'
                    ? 'border-orange-500'
                    : cardEvent.phase === 'red'
                    ? 'border-red-600 animate-shake'
                    : 'border-yellow-400'
                }`}
              >
                <div className="my-1">
                  <PixelReferee
                    pose={
                      cardEvent.phase === 'warning'
                        ? 'warning'
                        : cardEvent.phase === 'red'
                        ? 'red'
                        : 'yellow'
                    }
                  />
                </div>

                <div
                  className={`text-xs sm:text-sm font-black uppercase tracking-widest mt-1 ${
                    cardEvent.phase === 'warning'
                      ? 'text-orange-400'
                      : cardEvent.phase === 'red'
                      ? 'text-red-500'
                      : 'text-yellow-400'
                  }`}
                >
                  {cardEvent.phase === 'warning' && '⚠️ OFFICIAL WARNING!'}
                  {cardEvent.phase === 'yellow' && '🟨 YELLOW CARD!'}
                  {cardEvent.phase === 'secondYellow' && '🟨 SECOND YELLOW...'}
                  {cardEvent.phase === 'red' && '🟥 RED CARD! SENT OFF!'}
                </div>

                <div className="text-[7px] text-gray-200 mt-1 font-mono uppercase font-bold">
                  {cardEvent.reason}
                </div>

                {cardEvent.subCommentary && (
                  <div className="text-[7px] text-gray-400 mt-1 italic leading-tight px-2">
                    "{cardEvent.subCommentary}"
                  </div>
                )}

                {cardEvent.canUseVar && (
                  <div className="w-full mt-3 pt-2 border-t border-zinc-800 relative z-50 pointer-events-auto">
                    <button
                      type="button"
                      onClick={onTriggerVar}
                      className="w-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-black font-black py-2 px-3 rounded text-[8px] uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-1.5 relative z-50 pointer-events-auto"
                    >
                      <span>📺 CHALLENGE RULING (VAR)</span>
                    </button>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-sky-400 h-full origin-left animate-[shrink_4.5s_linear_forwards]"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="text-[6px] text-sky-300/80 uppercase tracking-widest block mt-1">
                      4.5s WINDOW TO CONTEST ANSWER
                    </span>
                  </div>
                )}
              </div>
            )}

            {cardEvent.phase === 'varEar' && (
              <div className="w-full max-w-[270px] bg-zinc-950 border-4 border-sky-400 rounded-xl p-4 text-center shadow-2xl flex flex-col items-center">
                <PixelReferee pose="ear" />
                <div className="text-xs font-black text-sky-400 uppercase tracking-widest mt-2 animate-pulse">
                  🎧 VAR CHECK IN PROGRESS
                </div>
                <div className="text-[7px] text-gray-200 mt-1 uppercase font-bold">
                  {cardEvent.reason}
                </div>
                {cardEvent.subCommentary && (
                  <div className="text-[7px] text-gray-400 mt-1 italic">
                    "{cardEvent.subCommentary}"
                  </div>
                )}
              </div>
            )}

            {cardEvent.phase === 'varChecking' && (
              <div className="w-full max-w-[270px] bg-[#06121c] border-4 border-sky-400 rounded-xl p-3 text-center shadow-2xl relative overflow-hidden scanlines">
                <div className="flex justify-between items-center border-b border-sky-800 pb-1 mb-2 text-[6px] font-mono text-sky-300">
                  <span className="bg-sky-500 text-black font-black px-1.5 py-0.5 rounded">
                    VAR REVIEW
                  </span>
                  <span className="animate-pulse">● CHECKING DATABASE...</span>
                </div>

                <div className="py-3 px-2 bg-black/60 border border-sky-900 rounded relative overflow-hidden">
                  <div className="text-[7px] text-gray-400 uppercase mb-1">
                    CONTESTED SUBMISSION:
                  </div>
                  <div className="text-xs font-mono font-black text-yellow-300 tracking-wider uppercase">
                    "{cardEvent.contestedInput}"
                  </div>
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-ping" />
                </div>

                {cardEvent.subCommentary && (
                  <div className="text-[7px] text-sky-300/80 italic mt-2">
                    "{cardEvent.subCommentary}"
                  </div>
                )}
              </div>
            )}

            {cardEvent.phase === 'varCancelled' && (
              <div className="w-full max-w-[270px] bg-zinc-950 border-4 border-emerald-400 rounded-xl p-3 text-center shadow-2xl flex flex-col items-center">
                <PixelReferee pose="playOn" />
                <div className="mt-1 border-2 border-emerald-400 bg-emerald-950/90 text-emerald-300 font-black text-[10px] px-3 py-1 rounded uppercase tracking-widest shadow-lg">
                  ✅ CARD CANCELLED!
                </div>
                <div className="text-sm font-mono font-black text-green-400 mt-1">
                  +15m PROVISIONAL GOAL
                </div>
                {cardEvent.subCommentary && (
                  <div className="text-[7px] text-gray-300 mt-1 italic">
                    "{cardEvent.subCommentary}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {flightPhase === 'revealed' && currentKickResult?.type === 'timeout' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 pointer-events-auto">
            <div className="bg-gray-950 border-4 border-red-600 p-4 rounded text-center shadow-2xl max-w-xs relative z-50">
              <div className="text-2xl mb-1">⏱️ 🛑</div>
              <div className="text-xs font-black text-red-500 uppercase tracking-widest">
                BLANKED! OUT OF TIME
              </div>
              <div className="text-[8px] text-gray-300 mt-2 italic leading-relaxed">
                "{currentKickResult.banter}"
              </div>
              <button
                type="button"
                onClick={nextFixture}
                className="mt-4 bg-red-600 hover:bg-red-500 text-white font-black text-[8px] px-5 py-2.5 rounded uppercase tracking-wider transition-all active:scale-95 cursor-pointer relative z-[60] pointer-events-auto shadow-lg"
              >
                CONTINUE PLAY ➔
              </button>
            </div>
          </div>
        )}

        {(flightPhase === 'revealed' || flightPhase === 'flying') && currentKickResult?.type === 'hit' && (
          <div
            className={`absolute inset-x-3 top-1/4 z-50 bg-gray-950/95 border-4 rounded p-3 text-center shadow-2xl backdrop-blur-md transition-opacity duration-300 pointer-events-auto ${flightPhase === 'revealed' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ borderColor: currentKickResult.tierColor }}
          >
            <div
              className="text-2xl sm:text-3xl font-black tracking-tight font-mono"
              style={{ color: currentKickResult.tierColor }}
            >
              +{rollingMeters}m
            </div>
            
            <div className={`transition-opacity duration-500 ${flightPhase === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-white mt-1">
                {currentKickResult.tierName}
              </div>
              <div className="text-[8px] text-gray-300 italic mt-2 leading-relaxed">
                "{currentKickResult.banter}"
              </div>
              <div className="text-[7px] text-gray-400 mt-2 font-mono">
                PLAYER: {currentKickResult.player?.name}
              </div>

              <button
                type="button"
                onClick={nextFixture}
                className="mt-3 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-[9px] px-6 py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer relative z-[60] pointer-events-auto shadow-md"
              >
                CONTINUE PLAY ➔
              </button>
            </div>
          </div>
        )}
      </div>

      <PixelCrowdSide side="right" excitement={crowdExcitement} />
    </div>
  );
}
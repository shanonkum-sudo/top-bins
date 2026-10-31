import React, { useState, useEffect } from 'react';
import { PixelStriker, PixelBall, PixelCrowdTop, PixelCrowdSide } from './PixelSprites';
import { sound } from '../utils/audio';

export default function ArcadePitch({ currentKickResult, nextFixture, readCountdown }) {
  // Flight state: 'idle' -> 'flying' -> 'revealed'
  const [flightPhase, setFlightPhase] = useState('idle');
  // Rolling number for the dramatic reveal
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

    // Begin flight immediately
    setFlightPhase('flying');
    sound.playKick();

    // Rapidly roll the numbers up while ball is in the air
    const targetMeters = currentKickResult.meters || 0;
    let startTimestamp = null;
    const duration = 2500; // Finish rolling slightly before the ball lands

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setRollingMeters(Math.floor(easeOut * targetMeters));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);

    // Slower, dramatic flight: 2.8s before reveal
    const flightTimer = setTimeout(() => {
      setFlightPhase('revealed');
      const isTopBins = currentKickResult.meters >= 81;

      // Tier-scaled crowd roar triggered right at impact
      sound.playCrowdRoar(currentKickResult.tierKey || 'tapIn');
      sound.playChime(isTopBins);
    }, 2800);

    return () => clearTimeout(flightTimer);
  }, [currentKickResult]);

  const meters = currentKickResult?.meters || 0;
  const isTopBins = meters >= 81;
  const crowdExcitement = flightPhase === 'revealed' ? (isTopBins ? 'topBins' : meters >= 61 ? 'high' : 'low') : 'low';

  // Distance to pixel mapping: 100m hits -345px directly into top net
  let ballY = 0;
  let ballScale = 1;
  let ballShadowScale = 0.8;

  if (flightPhase === 'flying' || flightPhase === 'revealed') {
    ballY = -(meters * 3.45);
    ballScale = isTopBins ? 1.5 : meters > 40 ? 1.3 : 1.1;
    ballShadowScale = isTopBins ? 0.3 : 0.6;
  }

  // Camera zoom: focused on player during idle, pulls back smoothly during flight
  // If it's a Top Bins and just revealed, add a CSS shake!
  const isShaking = flightPhase === 'revealed' && isTopBins;
  const cameraTransform = flightPhase === 'idle'
    ? 'scale(1.25) translateY(20px)'
    : 'scale(1) translateY(0px)';

  return (
    <div className={`relative w-full h-[380px] sm:h-[420px] bg-[#0c2415] rounded-xl border-4 border-[#25613a] shadow-2xl overflow-hidden flex select-none scanlines pixelated ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
      
      {/* Left Touchline Crowd */}
      <PixelCrowdSide side="left" excitement={crowdExcitement} />

      {/* Main Pitch Field */}
      <div className="relative flex-1 h-full overflow-hidden bg-[#143e23] flex flex-col justify-between">
        
        {/* Top Stadium Boundary & Advertising */}
        <div className="relative z-20 w-full bg-[#0a190e] border-b-2 border-[#1c4d2c]">
          <PixelCrowdTop excitement={crowdExcitement} />
          <div className="w-full bg-yellow-400 text-black text-[6px] py-0.5 px-2 flex justify-between font-bold tracking-widest uppercase">
            <span>TOP BINS 2D</span>
            <span>MATCHDAY ARENA</span>
            <span>1 CREDIT</span>
          </div>
        </div>

        {/* Dynamic Zooming Camera Stage */}
        <div
          className="relative flex-1 flex flex-col justify-between transition-transform duration-[1400ms] ease-out origin-bottom"
          style={{ transform: cameraTransform }}
        >
          {/* Top Goal Net */}
          <div className="relative z-10 w-full flex flex-col items-center pt-2">
            <div className="w-48 h-9 border-2 border-white/90 border-b-0 bg-white/20 rounded-t flex items-center justify-center backdrop-blur-xs shadow-inner">
              <span className={`text-[8px] font-mono font-black tracking-widest text-yellow-300 drop-shadow transition-opacity duration-700 ${flightPhase === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
                🥅 100m • TOP BINS
              </span>
            </div>
            <div className="w-60 h-7 border-2 border-white/35 border-t-0" />
          </div>

          {/* Yard Distance Guidelines: ONLY visible after ball lands */}
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

          {/* Turf Grass Stripes */}
          <div className="absolute inset-0 pitch-stripes opacity-40 pointer-events-none" />

          {/* Penalty Spot & Striker Area */}
          <div className="relative z-10 w-full flex flex-col items-center pb-6">
            <div className="w-full flex justify-center items-center relative">
              {/* Penalty Spot Chalk */}
              <div className="absolute bottom-3 left-[54%] -translate-x-1/2 w-2 h-2 bg-white/70 rounded-full" />

              {/* Striker */}
              <div className="absolute bottom-2 left-[36%] -translate-x-1/2">
                <PixelStriker isKicking={flightPhase !== 'idle'} />
              </div>

              {/* The Moving Ball & Following Answer Tag */}
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
                {/* FLOATING ANSWER BADGE FOLLOWING THE BALL */}
                {flightPhase !== 'idle' && currentKickResult?.player?.name && (
                  <div className="absolute -top-7 whitespace-nowrap z-30 pointer-events-none animate-bounce">
                    <div className="bg-black/85 border border-yellow-400/90 text-yellow-300 text-[6px] sm:text-[7px] font-mono font-black px-2 py-0.5 rounded shadow-lg tracking-wider uppercase flex items-center gap-1 backdrop-blur-xs">
                      <span>⚽</span>
                      <span>{currentKickResult.player.name}</span>
                    </div>
                    {/* Tiny triangle indicator pointing down at the ball */}
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-yellow-400/90 mx-auto" />
                  </div>
                )}

                {/* Dynamic Turf Shadow */}
                <div
                  className="absolute -bottom-1 w-3 h-1 bg-black/60 rounded-full transition-transform duration-300"
                  style={{ transform: `scale(${ballShadowScale})` }}
                />

                {/* Scaled Ball */}
                <div
                  className="transition-transform duration-700"
                  style={{ transform: `scale(${ballScale})` }}
                >
                  <PixelBall size={17} />
                </div>

                {/* Dust trail during flight */}
                {flightPhase === 'flying' && (
                  <div className="absolute -bottom-2 w-4 h-2 bg-white/50 rounded-full animate-ping opacity-60" />
                )}

                {/* Landing Beacon Sonar */}
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

        {/* 2s Reading Countdown Overlay */}
        {readCountdown > 0 && flightPhase === 'idle' && (
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

        {/* Timeout / Blanked State Banner */}
        {flightPhase === 'revealed' && currentKickResult?.type === 'timeout' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
            <div className="bg-gray-950 border-4 border-red-600 p-4 rounded text-center shadow-2xl max-w-xs">
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
                className="mt-4 bg-red-600 hover:bg-red-500 text-white font-black text-[8px] px-5 py-2.5 rounded uppercase tracking-wider transition-all active:scale-95 cursor-pointer pointer-events-auto shadow-lg"
              >
                CONTINUE PLAY ➔
              </button>
            </div>
          </div>
        )}

        {/* Reveal Result Banner (Now with Rolling Number) */}
        {(flightPhase === 'revealed' || flightPhase === 'flying') && currentKickResult?.type === 'hit' && (
          <div
            className={`absolute inset-x-3 top-1/4 z-50 bg-gray-950/95 border-4 rounded p-3 text-center shadow-2xl backdrop-blur-md transition-opacity duration-300 ${flightPhase === 'revealed' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ borderColor: currentKickResult.tierColor }}
          >
            <div
              className="text-2xl sm:text-3xl font-black tracking-tight font-mono"
              style={{ color: currentKickResult.tierColor }}
            >
              +{rollingMeters}m
            </div>
            
            {/* Only show the tier name and banter AFTER the ball lands */}
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
                className="mt-3 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-[9px] px-6 py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer pointer-events-auto shadow-md"
              >
                CONTINUE PLAY ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Touchline Crowd */}
      <PixelCrowdSide side="right" excitement={crowdExcitement} />
    </div>
  );
}
import React from 'react';
import { sound } from '../utils/audio';

export default function PressConference({
  currentQuestion,
  isInputLocked,
  shoot,
  timeLeft,
  totalTime,
  readCountdown,
  currentKickResult
}) {
  const isTimeCritical = timeLeft <= 5 && readCountdown === 0;

  let managerExpression = 'calm';
  let speechBubbleText = null;

  if (currentKickResult) {
    if (currentKickResult.type === 'hit') {
      managerExpression = 'speaking';
      speechBubbleText = "SPOT ON, NEXT QUESTION!";
    } else {
      managerExpression = 'sad';
      speechBubbleText = "SACKED IN THE MORNING...";
    }
  } else if (isTimeCritical) {
    managerExpression = 'sweating';
  }

  return (
    <div className={`relative w-full h-[320px] bg-[#0c1624] rounded-xl border-4 border-[#243b55] shadow-inner overflow-hidden flex flex-col justify-between p-2 select-none scanlines pixelated transition-all ${currentKickResult ? 'ring-4 ring-white animate-pulse' : ''}`}>
      
      {/* 1. Top Press Room Border (Cameras & Flashes) */}
      <div className="flex justify-between items-center bg-[#060b12] border border-[#243b55] rounded px-3 py-1 text-[7px] text-gray-300">
        <span className="animate-pulse text-red-500 font-bold">🔴 LIVE PRESS ROOM</span>
        <span className="tracking-widest uppercase text-yellow-400 font-bold">THE HOT SEAT</span>
        <span className="animate-pulse text-white font-bold">📸 FLASH!</span>
      </div>

      {/* 2. Middle Stage: Broadcast Blue Wall & Larger Pixel Manager */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-1 bg-[#102238] rounded border border-[#1b3656] overflow-hidden">
        
        {/* Clean, Distributed Retro Sponsor Backdrop Grid */}
        <div className="absolute inset-0 opacity-40 grid grid-cols-4 grid-rows-3 gap-4 p-4 pointer-events-none select-none items-center justify-items-center text-xs text-blue-300/80 font-mono">
          <span>🎤</span><span>📷</span><span>⭐</span><span>📰</span>
          <span>🏆</span><span>⚽</span><span>🎙️</span><span>⭐</span>
          <span>📷</span><span>📰</span><span>⚽</span><span>🎤</span>
        </div>

        {/* Manager Speech Bubble */}
        {speechBubbleText && (
          <div className="absolute top-2 z-30 bg-white text-black font-black text-[8px] px-2.5 py-1 rounded-lg border-2 border-black shadow-lg animate-bounce uppercase">
            💬 "{speechBubbleText}"
          </div>
        )}

        {/* Slightly Larger Pixel Manager Character Container */}
        <div className="relative z-20 flex flex-col items-center mt-3">
          <div className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center shadow-2xl transition-all ${
            managerExpression === 'sweating' ? 'bg-amber-950 border-amber-400 animate-pulse' :
            managerExpression === 'speaking' ? 'bg-blue-950 border-blue-400 scale-105' :
            managerExpression === 'sad' ? 'bg-red-950 border-red-500 opacity-80' :
            'bg-[#162b47] border-blue-500'
          }`}>
            {/* Retro Pixel Manager Avatar */}
            <div className="relative flex flex-col items-center justify-center scale-125">
              <div className="w-8 h-6 bg-[#d4a373] rounded-t-lg relative flex flex-col items-center justify-center border border-black/30">
                <div className="absolute top-0 w-full h-2 bg-[#3a2518] rounded-t-lg" />
                <div className="flex gap-2 mt-1">
                  <div className={`w-1 h-1 bg-black rounded-full ${managerExpression === 'sad' ? 'rotate-45' : ''}`} />
                  <div className={`w-1 h-1 bg-black rounded-full ${managerExpression === 'sad' ? '-rotate-45' : ''}`} />
                </div>
                <div className="mt-1">
                  {managerExpression === 'speaking' && <div className="w-2 h-1 bg-black rounded-full animate-ping" />}
                  {managerExpression === 'sweating' && <div className="w-2 h-0.5 bg-black rounded-full" />}
                  {managerExpression === 'sad' && <div className="w-2 h-0.5 bg-red-700 rounded-full translate-y-0.5" />}
                  {managerExpression === 'calm' && <div className="w-2 h-0.5 bg-black rounded-full" />}
                </div>
              </div>
              <div className="w-10 h-4 bg-[#111c2e] rounded-b border-t border-blue-400/50 flex justify-center items-center">
                <div className="w-2 h-3 bg-white border-x border-black/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Solid Press Table & Studio Microphone */}
        <div className="absolute bottom-0 w-full h-8 bg-[#1e2f47] border-t-2 border-[#2e4c73] flex items-center justify-center z-20 shadow-lg">
          <div className="flex flex-col items-center -translate-y-3">
            <div className="w-3 h-5 bg-gray-600 border border-gray-400 rounded-t-full flex items-center justify-center shadow">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
            <div className="w-1 h-3 bg-gray-400" />
            <div className="w-5 h-1.5 bg-gray-300 rounded shadow" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Press Table Options (Clickable Multiple Choice Buttons) */}
      {Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 relative z-30 mt-1">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isInputLocked}
              onClick={() => {
                sound.playBeep();
                shoot(opt);
              }}
              className="bg-[#12243b] hover:bg-[#1a3454] active:scale-95 border-2 border-[#243b55] hover:border-yellow-400 text-yellow-300 font-mono text-[9px] p-2.5 rounded uppercase tracking-wider transition-all shadow-lg cursor-pointer disabled:opacity-50 pointer-events-auto"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { sound } from '../utils/audio';

export default function HowToPlayModal({ gameMode = 'daily', onClose }) {
  const handleClose = () => {
    sound.playBeep();
    onClose();
  };

  const renderRules = () => {
    if (gameMode === 'cards') {
      return (
        <>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-red-900/50 border border-red-500 text-red-400 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
            <p><strong className="text-white">Grace Period:</strong> Build your distance score safely. Mistakes will not penalize you until you cross the 150m threshold.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-red-900/50 border border-red-500 text-red-400 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
            <p><strong className="text-white">Hardcore Mode:</strong> Past 150m, the training wheels are off! Every incorrect guess immediately draws a referee card.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-red-900/50 border border-red-500 text-red-400 rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
            <p><strong className="text-white">3 Strikes & VAR:</strong> Warning ➔ Yellow ➔ Red Card (Game Over). Use your 1 VAR Challenge to contest a booking!</p>
          </div>
        </>
      );
    }

    if (gameMode === 'endless') {
      return (
        <>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-900/50 border border-blue-500 text-blue-400 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
            <p><strong className="text-white">The Hot Seat:</strong> Survive an endless barrage of press conference questions. One wrong answer or timeout ends the run.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-900/50 border border-blue-500 text-blue-400 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
            <p><strong className="text-white">Flat Scoring:</strong> Every correct answer is worth exactly 15 Approval Points.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-900/50 border border-blue-500 text-blue-400 rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
            <p><strong className="text-white">Shrinking Clock:</strong> The shot clock starts at 20 seconds, but speeds up the longer you survive. Think fast!</p>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 bg-emerald-600/30 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
          <p><strong className="text-white">Daily Fixture:</strong> Answer 7 rounds of football trivia covering Europe's top 5 leagues.</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 bg-emerald-600/30 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
          <p><strong className="text-white">Beat the Shot Clock:</strong> You have a 20-second shot clock per question to lock in your answer.</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 bg-emerald-600/30 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
          <p><strong className="text-white">Score Top Bins:</strong> Correct answers shoot the ball into the net and build up your distance meter and match score!</p>
        </div>
      </>
    );
  };

  const headerColor = gameMode === 'cards' ? 'text-red-400' : gameMode === 'endless' ? 'text-blue-400' : 'text-emerald-400';
  const buttonColor = gameMode === 'cards' ? 'bg-red-600 hover:bg-red-500' : gameMode === 'endless' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500';
  const borderColor = gameMode === 'cards' ? 'border-red-500/50' : gameMode === 'endless' ? 'border-blue-500/50' : 'border-emerald-500/50';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-zinc-900 border-2 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-zinc-200 ${borderColor}`}>
        
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
          <h2 className={`text-lg font-black uppercase tracking-wide flex items-center gap-2 ${headerColor}`}>
            🎮 How to Play
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white text-base font-bold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-zinc-300">
          {renderRules()}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleClose}
            className={`w-full py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer ${buttonColor}`}
          >
            Got It, Let's Play!
          </button>
        </div>

      </div>
    </div>
  );
}
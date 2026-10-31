import React, { useState } from 'react';

export default function MainMenu({ onStartGame }) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4 select-none">
      {/* Retro Arcade Title Container */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] uppercase font-mono">
          Top Bins
        </h1>
        <p className="text-zinc-400 text-sm md:text-base tracking-widest mt-2 uppercase">
          Football Trivia Arcade
        </p>
      </div>

      {/* Main Menu Action Buttons */}
      <div className="flex flex-col gap-4 w-64 md:w-72 items-center">
        <button
          onClick={onStartGame}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_6px_0_#065f46] hover:shadow-[0_3px_0_#065f46] hover:translate-y-1 transition-all"
        >
          ⚽ Play Match
        </button>

        <button
          onClick={() => setShowInstructions(true)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_6px_0_#1e40af] hover:shadow-[0_3px_0_#1e40af] hover:translate-y-1 transition-all"
        >
          📖 How to Play
        </button>
      </div>

      {/* Footer info */}
      <div className="absolute bottom-6 text-xs text-zinc-600 tracking-widest uppercase">
        Public Playtest Edition v1.0
      </div>

      {/* How to Play Modal Overlay */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border-2 border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative text-zinc-200">
            
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                🎮 How to Play
              </h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-zinc-400 hover:text-white text-xl font-bold px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-4 text-sm md:text-base text-zinc-300">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-emerald-600/30 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                <p><strong className="text-white">Answer Football Trivia:</strong> Test your knowledge across clubs, international careers, legendary stats, and historic moments.</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-emerald-600/30 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <p><strong className="text-white">Beat the Shot Clock:</strong> Make your decisions quickly before time runs out to secure maximum points for your score streak.</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-emerald-600/30 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                <p><strong className="text-white">Score Top Bins:</strong> Correct answers shoot the ball into the top bins. String answers together to build a legendary match score!</p>
              </div>
            </div>

            {/* Close Modal Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Got It, Let's Play!
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
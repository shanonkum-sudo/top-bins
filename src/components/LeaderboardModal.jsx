import React, { useState, useEffect } from 'react';
import { getTopScores, submitScore } from '../utils/supabase';
import { sound } from '../utils/audio';

export function LeaderboardModal({ finalScore, gameMode, onClose }) {
  const [activeTab, setActiveTab] = useState(gameMode === 'cards' ? 'cards' : 'endless');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [initials, setInitials] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPlayableMode = finalScore !== undefined && finalScore > 0 && (gameMode === 'endless' || gameMode === 'cards');

  useEffect(() => {
    fetchScores(activeTab);
  }, [activeTab]);

  const fetchScores = async (mode) => {
    setLoading(true);
    const data = await getTopScores(mode);
    setScores(data);
    setLoading(false);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!initials.trim() || submitting) return;

    sound.playBeep();
    setSubmitting(true);
    const cleanInitials = initials.trim().toUpperCase().slice(0, 3);

    const result = await submitScore(cleanInitials, finalScore, gameMode);
    if (result.success) {
      setSubmitted(true);
      setActiveTab(gameMode);
      fetchScores(gameMode);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono select-text">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-emerald-500/30 text-white">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-xl font-black tracking-wider text-emerald-400 flex items-center gap-2">
            🏆 WORLD RANKINGS
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isPlayableMode && !submitted && (
          <div className="mb-6 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-center">
            <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">New Score: {finalScore} pts</p>
            <p className="text-sm text-slate-300 mb-3">Enter 3 Initials for the Arcade Hall of Fame:</p>
            <form onSubmit={handleScoreSubmit} className="flex gap-2 justify-center">
              <input
                type="text"
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                placeholder="ABC"
                autoFocus
                className="w-24 bg-slate-950 border-2 border-emerald-500 text-center text-2xl font-black tracking-widest text-emerald-400 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400 select-text"
              />
              <button
                type="submit"
                disabled={submitting || initials.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 rounded-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition cursor-pointer"
              >
                {submitting ? '...' : 'SUBMIT'}
              </button>
            </form>
          </div>
        )}

        <div className="flex rounded-lg bg-slate-950 p-1 mb-4 border border-slate-800">
          <button
            onClick={() => { sound.playBeep(); setActiveTab('endless'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition cursor-pointer ${
              activeTab === 'endless' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎙️ PRESS CONFERENCE
          </button>
          <button
            onClick={() => { sound.playBeep(); setActiveTab('cards'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition cursor-pointer ${
              activeTab === 'cards' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            🟥 RED CARD
          </button>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 min-h-[220px] max-h-[260px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm animate-pulse">
              Loading global records...
            </div>
          ) : scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs">
              <p>No records found for this mode yet.</p>
              <p className="mt-1 text-emerald-400">Be the first on the board!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((entry, index) => (
                <div 
                  key={entry.id || index}
                  className={`flex justify-between items-center px-3 py-2 rounded border text-sm ${
                    index === 0 
                      ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' 
                      : index === 1 
                      ? 'bg-slate-300/10 border-slate-300/30 text-slate-200'
                      : index === 2 
                      ? 'bg-amber-700/10 border-amber-700/30 text-amber-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black w-5 text-center text-xs">#{index + 1}</span>
                    <span className="font-bold tracking-wider">{entry.player_name}</span>
                  </div>
                  <span className="font-black text-white">{entry.score} <span className="text-xs font-normal text-slate-400">pts</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
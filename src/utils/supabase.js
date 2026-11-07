import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// A secret that lives only in this browser. It proves you own the name you submit with.
const TOKEN_KEY = 'topBinsOwnerToken';
let memoryToken = null; // fallback if the browser blocks local storage

function getOwnerToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID() + crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    if (!memoryToken) memoryToken = crypto.randomUUID() + crypto.randomUUID();
    return memoryToken;
  }
}

// Submit a player's score.
// The database only saves it if the name is yours (or new) and the score beats your old one.
// Returns { success: true } or { success: false, taken: true } if the name belongs to someone else.
export async function submitScore(playerName, score, mode) {
  const { data, error } = await supabase.rpc('submit_score', {
    p_name: playerName,
    p_score: score,
    p_mode: mode,
    p_token: getOwnerToken(),
  });

  if (error) {
    console.error('Failed to submit score:', error);
    return { success: false, error };
  }
  if (data === 'name_taken') {
    return { success: false, taken: true };
  }
  if (data !== 'ok') {
    return { success: false, error: new Error('Invalid submission') };
  }
  return { success: true };
}

// Fetch top 50 scores for a specific mode ('endless' or 'cards')
export async function getTopScores(mode) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('mode', mode)
      .order('score', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}
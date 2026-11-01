import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Submit a player score
export async function submitScore(playerName, score, mode) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ player_name: playerName.trim().toUpperCase().slice(0, 10), score, mode }]);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Failed to submit score:', err);
    return { success: false, error: err };
  }
}

// Fetch top 10 scores for a specific mode ('endless' or 'cards')
export async function getTopScores(mode) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('mode', mode)
      .order('score', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}
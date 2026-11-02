import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Submit or update a player's high score
export async function submitScore(playerName, score, mode) {
  const cleanName = playerName.trim().toUpperCase().slice(0, 10);

  try {
    // 1. Check if the player already has an entry for this specific game mode
    const { data: existingEntry, error: fetchError } = await supabase
      .from('leaderboard')
      .select('id, score')
      .eq('player_name', cleanName)
      .eq('mode', mode)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingEntry) {
      // 2. If they exist, only update if the new score is strictly higher
      if (score > existingEntry.score) {
        const { data, error: updateError } = await supabase
          .from('leaderboard')
          .update({ score })
          .eq('id', existingEntry.id);

        if (updateError) throw updateError;
        return { success: true, updated: true, data };
      }
      // If the new score is equal or lower, keep the existing high score intact
      return { success: true, updated: false, message: 'Existing high score retained.' };
    } else {
      // 3. New player for this mode: insert a fresh entry
      const { data, error: insertError } = await supabase
        .from('leaderboard')
        .insert([{ player_name: cleanName, score, mode }]);

      if (insertError) throw insertError;
      return { success: true, data };
    }
  } catch (err) {
    console.error('Failed to submit score:', err);
    return { success: false, error: err };
  }
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
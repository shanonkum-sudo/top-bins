// Levenshtein distance for fuzzy matching player names
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function findFuzzyPlayer(inputName, allPlayers) {
  const cleanInput = inputName.trim().toLowerCase();
  if (!cleanInput) return null;

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const player of allPlayers) {
    const targetName = player.name.toLowerCase();

    // Exact or substring match
    if (targetName === cleanInput) return player;
    
    // Check surname direct match (e.g., "Ronaldo" matches "Cristiano Ronaldo")
    const parts = targetName.split(' ');
    if (parts.some((part) => part.toLowerCase() === cleanInput)) {
      return player;
    }

    // Levenshtein similarity calculation
    const distance = levenshteinDistance(cleanInput, targetName);
    const maxLen = Math.max(cleanInput.length, targetName.length);
    const similarity = 1 - distance / maxLen;

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = player;
    }
  }

  // 75% similarity threshold allows forgiving 1-2 typos
  return highestSimilarity >= 0.72 ? bestMatch : null;
}
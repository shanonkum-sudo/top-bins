import fs from 'fs';
import path from 'path';

// 1. Bucket A: Verified Legends
const legendsPath = path.resolve('src/data/legends.json');
let legends = [];
try {
  legends = JSON.parse(fs.readFileSync(legendsPath, 'utf-8'));
} catch (e) {
  console.log("No legends.json found. (Consider creating src/data/legends.json for elite exact stats!)");
}

// 2. Modern Era Filter
const MODERN_LEAGUES = [
  'Category:Premier_League_players', 
  'Category:La_Liga_players', 
  'Category:Serie_A_players',
  'Category:Bundesliga_players',
  'Category:Ligue_1_players'
];

// 3. Factual Club Categories (Expanded to cover all major Top 5 League teams)
const CLUB_CATEGORIES = [
  // Premier League Giants & Historic
  { club: 'Manchester United', category: 'Category:Manchester_United_F.C._players' },
  { club: 'Liverpool', category: 'Category:Liverpool_F.C._players' },
  { club: 'Arsenal', category: 'Category:Arsenal_F.C._players' },
  { club: 'Chelsea', category: 'Category:Chelsea_F.C._players' },
  { club: 'Manchester City', category: 'Category:Manchester_City_F.C._players' },
  { club: 'Tottenham Hotspur', category: 'Category:Tottenham_Hotspur_F.C._players' },
  { club: 'Aston Villa', category: 'Category:Aston_Villa_F.C._players' },
  { club: 'Newcastle United', category: 'Category:Newcastle_United_F.C._players' },
  { club: 'Everton', category: 'Category:Everton_F.C._players' },
  { club: 'West Ham United', category: 'Category:West_Ham_United_F.C._players' },
  { club: 'Leicester City', category: 'Category:Leicester_City_F.C._players' },

  // La Liga Giants & Historic
  { club: 'Real Madrid', category: 'Category:Real_Madrid_CF_players' },
  { club: 'Barcelona', category: 'Category:FC_Barcelona_players' },
  { club: 'Atletico Madrid', category: 'Category:Atlético_Madrid_footballers' },
  { club: 'Sevilla', category: 'Category:Sevilla_FC_players' },
  { club: 'Valencia', category: 'Category:Valencia_CF_players' },
  { club: 'Athletic Bilbao', category: 'Category:Athletic_Bilbao_players' },
  { club: 'Real Sociedad', category: 'Category:Real_Sociedad_footballers' },
  { club: 'Villarreal', category: 'Category:Villarreal_CF_footballers' },

  // Serie A Giants & Historic
  { club: 'Juventus', category: 'Category:Juventus_FC_players' },
  { club: 'AC Milan', category: 'Category:A.C._Milan_players' },
  { club: 'Inter Milan', category: 'Category:Inter_Milan_players' },
  { club: 'Napoli', category: 'Category:SSC_Napoli_players' },
  { club: 'Roma', category: 'Category:AS_Roma_players' },
  { club: 'Lazio', category: 'Category:SS_Lazio_players' },
  { club: 'Fiorentina', category: 'Category:ACF_Fiorentina_players' },
  { club: 'Atalanta', category: 'Category:Atalanta_BC_players' },

  // Bundesliga Giants & Historic
  { club: 'Bayern Munich', category: 'Category:FC_Bayern_Munich_players' },
  { club: 'Borussia Dortmund', category: 'Category:Borussia_Dortmund_players' },
  { club: 'Bayer Leverkusen', category: 'Category:Bayer_04_Leverkusen_players' },
  { club: 'RB Leipzig', category: 'Category:RB_Leipzig_players' },
  { club: 'Eintracht Frankfurt', category: 'Category:Eintracht_Frankfurt_players' },
  { club: 'Borussia Mönchengladbach', category: 'Category:Borussia_Mönchengladbach_players' },
  { club: 'VfB Stuttgart', category: 'Category:VfB_Stuttgart_players' },

  // Ligue 1 Giants & Historic
  { club: 'Paris Saint-Germain', category: 'Category:Paris_Saint-Germain_F.C._players' },
  { club: 'Marseille', category: 'Category:Olympique_de_Marseille_players' },
  { club: 'Lyon', category: 'Category:Olympique_Lyonnais_players' },
  { club: 'Monaco', category: 'Category:AS_Monaco_FC_players' },
  { club: 'Lille', category: 'Category:Lille_OSC_players' }
];

// 4. Factual Award Categories
const AWARD_CATEGORIES = [
  { award: 'Ballon d\'Or', category: 'Category:Ballon_d\'Or_winners' },
  { award: 'World Cup Winner', category: 'Category:FIFA_World_Cup-winning_players' },
  { award: 'European Championship Winner', category: 'Category:UEFA_European_Championship-winning_players' },
  { award: 'Premier League Player of the Month', category: 'Category:Premier_League_Player_of_the_Month_winners' },
  { award: 'Premier League Player of the Season', category: 'Category:Premier_League_Player_of_the_Season_winners' },
  { award: 'PFA Player of the Year', category: 'Category:PFA_Players\'_Player_of_the_Year_winners' },
  { award: 'Premier League Golden Boot', category: 'Category:Premier_League_Golden_Boot_winners' },
  { award: 'La Liga Player of the Month', category: 'Category:La_Liga_Player_of_the_Month_winners' },
  { award: 'La Liga Best Player', category: 'Category:La_Liga_Best_Player_winners' },
  { award: 'Serie A Player of the Month', category: 'Category:Serie_A_Player_of_the_Month_winners' },
  { award: 'Serie A Footballer of the Year', category: 'Category:Serie_A_Footballer_of_the_Year_winners' },
  { award: 'Bundesliga Player of the Month', category: 'Category:Bundesliga_Player_of_the_Month_winners' },
  { award: 'German Footballer of the Year', category: 'Category:Footballer_of_the_Year_in_Germany' },
  { award: 'Ligue 1 Player of the Month', category: 'Category:UNFP_Player_of_the_Month_winners' },
  { award: 'Ligue 1 Player of the Year', category: 'Category:UNFP_Ligue_1_Player_of_the_Year_winners' }
];

// 5. Major Footballing Nations (Expanded for true global coverage)
const NATIONALITY_CATEGORIES = [
  // Europe
  { nationality: 'England', category: 'Category:English_men\'s_footballers' },
  { nationality: 'Spain', category: 'Category:Spanish_men\'s_footballers' },
  { nationality: 'Italy', category: 'Category:Italian_men\'s_footballers' },
  { nationality: 'Germany', category: 'Category:German_men\'s_footballers' },
  { nationality: 'France', category: 'Category:French_men\'s_footballers' },
  { nationality: 'Portugal', category: 'Category:Portuguese_men\'s_footballers' },
  { nationality: 'Netherlands', category: 'Category:Dutch_men\'s_footballers' },
  { nationality: 'Belgium', category: 'Category:Belgian_men\'s_footballers' },
  { nationality: 'Croatia', category: 'Category:Croatian_men\'s_footballers' },
  { nationality: 'Denmark', category: 'Category:Danish_men\'s_footballers' },
  { nationality: 'Switzerland', category: 'Category:Swiss_men\'s_footballers' },
  { nationality: 'Sweden', category: 'Category:Swedish_men\'s_footballers' },
  { nationality: 'Norway', category: 'Category:Norwegian_men\'s_footballers' },
  { nationality: 'Scotland', category: 'Category:Scottish_men\'s_footballers' },
  { nationality: 'Wales', category: 'Category:Welsh_men\'s_footballers' },
  
  // South America
  { nationality: 'Brazil', category: 'Category:Brazilian_men\'s_footballers' },
  { nationality: 'Argentina', category: 'Category:Argentine_men\'s_footballers' },
  { nationality: 'Uruguay', category: 'Category:Uruguayan_men\'s_footballers' },
  { nationality: 'Colombia', category: 'Category:Colombian_men\'s_footballers' },
  { nationality: 'Chile', category: 'Category:Chilean_men\'s_footballers' },
  
  // Africa
  { nationality: 'Senegal', category: 'Category:Senegalese_men\'s_footballers' },
  { nationality: 'Morocco', category: 'Category:Moroccan_men\'s_footballers' },
  { nationality: 'Nigeria', category: 'Category:Nigerian_men\'s_footballers' },
  { nationality: 'Ivory Coast', category: 'Category:Ivorian_men\'s_footballers' },
  { nationality: 'Ghana', category: 'Category:Ghanaian_men\'s_footballers' },
  { nationality: 'Egypt', category: 'Category:Egyptian_men\'s_footballers' },
  { nationality: 'Cameroon', category: 'Category:Cameroonian_men\'s_footballers' },
  
  // North America & Asia
  { nationality: 'United States', category: 'Category:American_men\'s_soccer_players' },
  { nationality: 'Mexico', category: 'Category:Mexican_men\'s_footballers' },
  { nationality: 'Japan', category: 'Category:Japanese_men\'s_footballers' },
  { nationality: 'South Korea', category: 'Category:South_Korean_men\'s_footballers' }
];

async function fetchCategoryMembers(categoryTitle) {
  let members = [];
  let cmcontinue = "";
  
  while (true) {
    let url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=500&format=json&origin=*`;
    if (cmcontinue) url += `&cmcontinue=${cmcontinue}`;
    
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'TopBinsApp/8.0 (yourname@example.com)' } });
      
      if (res.status === 429) {
        console.log(`\n⏳ Rate limit hit. Pausing for 4 seconds...`);
        await new Promise(r => setTimeout(r, 4000));
        continue; 
      }
      
      if (!res.ok) break;
      const data = await res.json();
      
      const pageMembers = (data.query?.categorymembers || [])
        .map(m => m.title)
        .filter(t => !t.startsWith('Category:') && !t.startsWith('List of'))
        .map(name => name.replace(/ \(footballer.*\)/i, '').replace(/ \(soccer.*\)/i, '').trim());
        
      members = members.concat(pageMembers);
      
      if (data.continue && data.continue.cmcontinue) {
        cmcontinue = data.continue.cmcontinue;
        await new Promise(r => setTimeout(r, 750)); 
      } else {
        break; 
      }
    } catch (err) {
      console.log(`\n❌ Error fetching ${categoryTitle}. Skipping...`);
      break;
    }
  }
  return members;
}

async function run() {
  console.log('⚡ Step 1: Building Modern Era Filter (Paginated & Polite)...');
  const modernPlayersSet = new Set();
  
  for (const league of MODERN_LEAGUES) {
    process.stdout.write(`📥 Fetching ${league}... `);
    const players = await fetchCategoryMembers(league);
    for (const p of players) {
      modernPlayersSet.add(p.toLowerCase());
    }
    console.log(`(${players.length} added)`);
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`🔒 Modern filter locked with ${modernPlayersSet.size} unique players.`);

  console.log('\n⚡ Step 2: Fetching Factual Club Rosters & Intersecting...');
  const playerMap = new Map();

  for (const leg of legends) {
    playerMap.set(leg.name.toLowerCase(), {
      name: leg.name,
      nationality: leg.nationality || 'Unknown',
      clubs: leg.clubs || [],
      trophies: leg.trophies || { serieA: 0, premierLeague: 0, laLiga: 0, championsLeague: 0, worldCup: 0 },
      awards: leg.awards || [],
      pickRate: leg.pickRate || 85
    });
  }

  for (const item of CLUB_CATEGORIES) {
    process.stdout.write(`📥 Fetching ${item.club.padEnd(25, ' ')}... `);
    const squad = await fetchCategoryMembers(item.category);
    let added = 0;

    for (const name of squad) {
      const key = name.toLowerCase();
      
      if (playerMap.has(key) || modernPlayersSet.has(key)) {
        if (!playerMap.has(key)) {
          playerMap.set(key, {
            name: name,
            nationality: "Various",
            clubs: [item.club],
            trophies: { serieA: 0, premierLeague: 0, laLiga: 0, championsLeague: 0, worldCup: 0 },
            awards: [],
            pickRate: Math.floor(Math.random() * 35) + 5 
          });
        } else {
          const existing = playerMap.get(key);
          if (!existing.clubs.includes(item.club)) {
            existing.clubs.push(item.club);
          }
        }
        added++;
      }
    }
    console.log(`(Kept ${added} out of ${squad.length})`);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n⚡ Step 3: Fetching Award Winners...');
  for (const item of AWARD_CATEGORIES) {
    process.stdout.write(`🏆 Fetching ${item.award.padEnd(35, ' ')}... `);
    const awardWinners = await fetchCategoryMembers(item.category);
    let matched = 0;
    
    for (const name of awardWinners) {
      const key = name.toLowerCase();
      if (playerMap.has(key)) {
        const existing = playerMap.get(key);
        if (!existing.awards.includes(item.award)) {
          existing.awards.push(item.award);
          matched++;
        }
      }
    }
    console.log(`(Matched ${matched})`);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n⚡ Step 4: Fetching Nationalities...');
  for (const item of NATIONALITY_CATEGORIES) {
    process.stdout.write(`🌍 Fetching ${item.nationality.padEnd(35, ' ')}... `);
    const natPlayers = await fetchCategoryMembers(item.category);
    let matched = 0;
    
    for (const name of natPlayers) {
      const key = name.toLowerCase();
      if (playerMap.has(key)) {
        const existing = playerMap.get(key);
        if (existing.nationality === "Various") {
          existing.nationality = item.nationality;
          matched++;
        }
      }
    }
    console.log(`(Matched ${matched})`);
    await new Promise(r => setTimeout(r, 1000));
  }

  const formatted = Array.from(playerMap.values()).map((p, idx) => ({
    id: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${idx}`,
    ...p
  }));

  const outPath = path.resolve('src/data/players.json');
  fs.writeFileSync(outPath, JSON.stringify(formatted, null, 2), 'utf-8');
  console.log(`\n✅ SUCCESS! ${formatted.length} factual, modern-era players saved to src/data/players.json.`);
}

run();
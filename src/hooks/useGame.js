import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import questionsData from '../data/questions.json';
import pressQuestionsData from '../data/pressQuestions.json';
import cardQuestionsData from '../data/cardQuestions.json';
import { findFuzzyPlayer } from '../utils/fuzzyMatch';
import { BANTER_LINES } from '../data/banter';
import { sound } from '../utils/audio';

// IMPORTANT: IMPORT YOUR SUPABASE CLIENT HERE.
import { supabase } from '../utils/supabase'; 

const BASE_SHOT_CLOCK = 20;
const READING_SECONDS = 3;
const TOTAL_FIXTURES = 7;
const HARDCORE_THRESHOLD = 150; 

const LAUNCH_DATE = new Date("2026-10-31T00:00:00+02:00"); 

function getDayNumber() {
  const now = new Date();
  const diffInMs = now - LAUNCH_DATE;
  return Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
}

function getTodaysFixtures(allGames) {
  if (!Array.isArray(allGames) || allGames.length === 0) return [];
  if (!allGames[0].fixtures) return allGames;
  const dayNum = getDayNumber();
  const safeIndex = dayNum % allGames.length; 
  return allGames[safeIndex]?.fixtures || [];
}

function getAllFixtures(allGames) {
  if (!Array.isArray(allGames) || allGames.length === 0) return [];
  if (!allGames[0].fixtures) return allGames;
  return allGames.flatMap((day) => day.fixtures || []);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const loadSaveData = () => {
  const saved = localStorage.getItem('topBinsSave');
  if (saved) return JSON.parse(saved);
  return {
    stats: { played: 0, currentStreak: 0, maxStreak: 0, totalDist: 0 },
    lastPlayedDay: -1,
    todayHistory: [],
    todayDistance: 0
  };
};

const logContestedAnswer = (questionPrompt, answerText, source = 'VAR') => {
  try {
    const existing = JSON.parse(localStorage.getItem('topBinsContestedAnswers') || '[]');
    existing.push({
      question: questionPrompt,
      contestedAnswer: answerText,
      source,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('topBinsContestedAnswers', JSON.stringify(existing));
  } catch (e) {
    console.warn('Could not log contested answer', e);
  }
};

// ==========================================
// BACKGROUND GUESS LOGGER
// ==========================================
const logPlayerGuess = async (rawGuess, mode, currentQ) => {
  // Silent fail catch so if Supabase is down, it doesn't break the game
  try {
    supabase.from('guess_logs').insert([
      {
        guess: rawGuess,
        game_mode: mode,
        question: currentQ?.prompt || 'No question prompt'
      }
    ]).then(({ error }) => {
      if (error) console.error("Guess log failed:", error);
    });
  } catch (err) {
    console.error("Could not reach Supabase logger", err);
  }
};

export function useGame() {
  const [gameState, setGameState] = useState('menu'); 
  const [gameMode, setGameMode] = useState('daily'); 
  const [fixtureIndex, setFixtureIndex] = useState(0);
  
  const [isHardcoreActive, setIsHardcoreActive] = useState(false);
  const [hardcoreTransitionEvent, setHardcoreTransitionEvent] = useState(null);

  const totalTime = useMemo(() => {
    if (gameMode === 'endless' || gameMode === 'cards') {
      const base = Math.max(8, BASE_SHOT_CLOCK - Math.floor(fixtureIndex / 3) * 3);
      return isHardcoreActive ? Math.max(6, base - 4) : base;
    }
    return BASE_SHOT_CLOCK;
  }, [gameMode, fixtureIndex, isHardcoreActive]);

  const [timeLeft, setTimeLeft] = useState(BASE_SHOT_CLOCK);
  const [readCountdown, setReadCountdown] = useState(READING_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentKickResult, setCurrentKickResult] = useState(null);
  const [invalidAttempt, setInvalidAttempt] = useState(null);

  const [shuffledPressQuestions, setShuffledPressQuestions] = useState(pressQuestionsData);
  const [shuffledCardQuestions, setShuffledCardQuestions] = useState(cardQuestionsData);
  const [pendingAutocorrect, setPendingAutocorrect] = useState(null); 

  const [strikes, setStrikes] = useState(0); 
  const [varAvailable, setVarAvailable] = useState(true);
  const [cardEvent, setCardEvent] = useState(null); 
  
  const cardTimerRef = useRef(null);
  const secondStepTimerRef = useRef(null);
  const hardcoreTimerRef = useRef(null);

  const [saveData, setSaveData] = useState(loadSaveData());
  const currentDayNum = getDayNumber();
  const hasPlayedToday = saveData.lastPlayedDay === currentDayNum;

  const todaysFixtures = useMemo(() => getTodaysFixtures(questionsData), []);
  const allFixturesPool = useMemo(() => getAllFixtures(questionsData), []);

  const activeFixtures = useMemo(() => {
    if (gameMode === 'daily') return todaysFixtures;
    if (gameMode === 'cards') return shuffledCardQuestions;
    if (gameMode === 'endless') return shuffledPressQuestions;
    return allFixturesPool;
  }, [gameMode, todaysFixtures, allFixturesPool, shuffledPressQuestions, shuffledCardQuestions]);

  const banterIndices = useRef({
    topBins: 0, worldie: 0, hollywoodBall: 0, throughBall: 0, tapIn: 0, timeout: 0, groan: 0
  });

  const getNextBanter = (categoryKey) => {
    const pool = BANTER_LINES[categoryKey] || BANTER_LINES.tapIn;
    const currentIndex = banterIndices.current[categoryKey] || 0;
    const line = pool[currentIndex % pool.length];
    banterIndices.current[categoryKey] = currentIndex + 1;
    return line;
  };

  const currentQuestion = useMemo(() => {
    if (!activeFixtures || activeFixtures.length === 0) return { validAnswers: [] };
    return activeFixtures[fixtureIndex % activeFixtures.length] || { validAnswers: [] };
  }, [fixtureIndex, activeFixtures]);

  const totalDistance = useMemo(() => {
    if (gameMode === 'daily' && gameState === 'finished' && hasPlayedToday && history.length === 0) {
      return saveData.todayDistance;
    }
    return history.reduce((sum, item) => sum + (item.meters || 0), 0);
  }, [history, gameState, gameMode, hasPlayedToday, saveData]);

  const clearCardTimers = () => {
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    if (secondStepTimerRef.current) clearTimeout(secondStepTimerRef.current);
    if (hardcoreTimerRef.current) clearTimeout(hardcoreTimerRef.current);
  };

  useEffect(() => {
    return () => clearCardTimers();
  }, []);

  useEffect(() => {
    if ((gameMode === 'endless' || gameMode === 'cards') && !isHardcoreActive && totalDistance >= HARDCORE_THRESHOLD) {
      setIsHardcoreActive(true);
      setIsTimerRunning(false);
      sound.playDoubleWhistle();

      setHardcoreTransitionEvent({
        title: "🚨 BALL KNOWLEDGE OVERLOAD!",
        subtitle: "SUDDEN DEATH PROTOCOL ENGAGED",
        description: "Training wheels are off. The clock is faster, and 1 wrong guess = 1 referee card!"
      });

      hardcoreTimerRef.current = setTimeout(() => {
        setHardcoreTransitionEvent(null);
        setIsTimerRunning(true);
      }, 3500);
    }
  }, [totalDistance, gameMode, isHardcoreActive]);

  useEffect(() => {
    if (gameState !== 'playing' || currentKickResult || cardEvent || pendingAutocorrect || hardcoreTransitionEvent) return;
    if (readCountdown > 0) {
      setIsTimerRunning(false);
      const timer = setTimeout(() => setReadCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTimerRunning(true);
    }
  }, [readCountdown, gameState, currentKickResult, cardEvent, pendingAutocorrect, hardcoreTransitionEvent]);

  const finishGame = useCallback((finalHistory) => {
    clearCardTimers();
    const finalDist = finalHistory.reduce((sum, item) => sum + (item.meters || 0), 0);
    
    if (gameMode === 'daily') {
      let newStreak = saveData.stats.currentStreak;
      if (saveData.lastPlayedDay === currentDayNum - 1) {
        newStreak += 1;
      } else if (saveData.lastPlayedDay !== currentDayNum) {
        newStreak = 1;
      }

      const newStats = {
        played: saveData.stats.played + 1,
        currentStreak: newStreak,
        maxStreak: Math.max(saveData.stats.maxStreak, newStreak),
        totalDist: saveData.stats.totalDist + finalDist
      };

      const newSave = {
        stats: newStats,
        lastPlayedDay: currentDayNum,
        todayHistory: finalHistory,
        todayDistance: finalDist
      };

      localStorage.setItem('topBinsSave', JSON.stringify(newSave));
      setSaveData(newSave);

      // --- NEW SUPABASE INSERT ---
      // Silently log the daily score for percentile calculations
      try {
        supabase.from('leaderboard').insert([
          { 
            mode: 'daily', 
            score: finalDist 
          }
        ]).then(({ error }) => {
          if (error) console.error("Failed to log daily run to leaderboard:", error);
        });
      } catch (err) {
        console.error("Could not reach Supabase for leaderboard", err);
      }
    }

    setCardEvent(null);
    setHardcoreTransitionEvent(null);
    setGameState('finished');
    setIsTimerRunning(false);
    setCurrentKickResult(null);
  }, [gameMode, saveData, currentDayNum]);

  const triggerCardStrike = useCallback((contestedInput, reasonText) => {
    if (cardEvent) return; 
    clearCardTimers();
    setIsTimerRunning(false);
    setInvalidAttempt(null);
    setPendingAutocorrect(null);

    const nextStrikes = strikes + 1;
    setStrikes(nextStrikes);

    const canUseVar = varAvailable && Boolean(contestedInput);
    const windowMs = canUseVar ? 4500 : 3500;

    const strikeKickData = {
      type: 'strike',
      meters: 0,
      tierName: nextStrikes === 1 ? 'WARNING ⚠️' : nextStrikes === 2 ? 'YELLOW CARD 🟨' : 'RED CARD 🟥',
      tierKey: 'groan',
      tierColor: nextStrikes === 1 ? '#fb923c' : nextStrikes === 2 ? '#facc15' : '#ef4444',
      banter: reasonText,
      question: currentQuestion,
      player: contestedInput ? { name: contestedInput } : null,
      allAnswers: currentQuestion.validAnswers || [],
    };

    setHistory((prev) => {
      const updatedHistory = [...prev, strikeKickData];

      if (nextStrikes === 1) {
        sound.playWhistle();
        setCardEvent({
          phase: 'warning',
          contestedInput,
          reason: reasonText,
          subCommentary: "Strict warning from the official. Calm down or get booked!",
          canUseVar,
          windowMs
        });

        cardTimerRef.current = setTimeout(() => {
          setCardEvent(null);
          setFixtureIndex((idx) => idx + 1);
          setTimeLeft(totalTime);
          setReadCountdown(READING_SECONDS);
        }, windowMs);
      } else if (nextStrikes === 2) {
        sound.playDoubleWhistle();
        setCardEvent({
          phase: 'yellow',
          contestedInput,
          reason: reasonText,
          subCommentary: "A clear caution! Watch your step, you're on a tightrope now.",
          canUseVar,
          windowMs
        });

        cardTimerRef.current = setTimeout(() => {
          setCardEvent(null);
          setFixtureIndex((idx) => idx + 1);
          setTimeLeft(totalTime);
          setReadCountdown(READING_SECONDS);
        }, windowMs);
      } else {
        sound.playDoubleWhistle();
        setCardEvent({
          phase: 'secondYellow',
          contestedInput,
          reason: '2ND YELLOW CARD...',
          subCommentary: "The referee reaches into the pocket once more...",
          canUseVar,
          windowMs: canUseVar ? 4800 : 3800
        });

        secondStepTimerRef.current = setTimeout(() => {
          sound.playWhistle();
          setCardEvent((prevEv) =>
            prevEv && (prevEv.phase === 'secondYellow' || prevEv.phase === 'red')
              ? { 
                  ...prevEv, 
                  phase: 'red', 
                  reason: 'SENT OFF! RED CARD 🟥', 
                  subCommentary: "Early bath! You've talked your way straight into an early shower." 
                }
              : prevEv
          );
        }, 1200);

        cardTimerRef.current = setTimeout(() => {
          finishGame(updatedHistory);
        }, canUseVar ? 4800 : 3800);
      }

      return updatedHistory;
    });
  }, [cardEvent, strikes, varAvailable, currentQuestion, totalTime, finishGame]);

  const triggerVarChallenge = () => {
    if (!cardEvent || !varAvailable || !cardEvent.canUseVar) return;
    clearCardTimers();
    sound.playBeep();

    const contestedName = cardEvent.contestedInput || 'CONTESTED PLAYER';
    setVarAvailable(false);

    setCardEvent({
      phase: 'varEar',
      contestedInput: contestedName,
      reason: 'HOLD PLAY! CHECKING WITH VAR BOOTH...',
      subCommentary: "The stadium holds its collective breath..."
    });

    cardTimerRef.current = setTimeout(() => {
      sound.playVarBeep();
      setCardEvent({
        phase: 'varChecking',
        contestedInput: contestedName,
        reason: 'MEASURING PLAYER ELIGIBILITY...',
        subCommentary: "Analyzing pixel frames and database logs..."
      });

      secondStepTimerRef.current = setTimeout(() => {
        sound.playDoubleWhistle();
        sound.playChime(false);

        setStrikes((prev) => Math.max(0, prev - 1));
        logContestedAnswer(currentQuestion.prompt, contestedName, 'VAR_CHALLENGE');

        setHistory((prev) => {
          const copy = [...prev];
          if (copy.length > 0) {
            copy[copy.length - 1] = {
              type: 'hit',
              meters: 15,
              tierName: 'VAR OVERTURNED (+15m)',
              tierKey: 'throughBall',
              tierColor: '#38bdf8',
              banter: 'Card cancelled by VAR! Provisional 15m awarded.',
              question: currentQuestion,
              player: { name: `${contestedName} (VAR)` },
              allAnswers: currentQuestion.validAnswers || [],
            };
          }
          return copy;
        });

        setCardEvent({
          phase: 'varCancelled',
          contestedInput: contestedName,
          reason: 'CARD CANCELLED! +15m AWARDED',
          subCommentary: "Absolute scenes in the technical area!"
        });

        cardTimerRef.current = setTimeout(() => {
          setCardEvent(null);
          setFixtureIndex((idx) => idx + 1);
          setTimeLeft(totalTime);
          setReadCountdown(READING_SECONDS);
        }, 2200);
      }, 2000);
    }, 1000);
  };

  const handleTimeout = useCallback(() => {
    setIsTimerRunning(false);
    setPendingAutocorrect(null);

    if (gameMode === 'cards' || isHardcoreActive) {
      triggerCardStrike('', 'SHOT CLOCK EXPIRED! DELAY OF GAME');
      return;
    }

    if (gameMode === 'endless') {
      const timeoutKick = {
        type: 'timeout',
        meters: 0,
        tierName: 'SACKED IN THE MORNING',
        tierKey: 'groan',
        tierColor: '#ef4444',
        banter: getNextBanter('timeout'),
        question: currentQuestion,
        player: null,
        allAnswers: currentQuestion.validAnswers || [],
      };
      
      setCurrentKickResult(timeoutKick);
      setHistory((prev) => [...prev, timeoutKick]);

      setTimeout(() => {
        finishGame([...history, timeoutKick]);
      }, 2200);
      return;
    }

    const kickData = {
      type: 'timeout',
      meters: 0,
      tierName: 'BLANKED!',
      tierKey: 'groan',
      tierColor: '#ef4444',
      banter: getNextBanter('timeout'),
      question: currentQuestion,
      player: null,
      allAnswers: currentQuestion.validAnswers || [],
    };
    setCurrentKickResult(kickData);
    setHistory((prev) => [...prev, kickData]);
  }, [currentQuestion, gameMode, isHardcoreActive, triggerCardStrike, finishGame, history]);

  useEffect(() => {
    if (!isTimerRunning || gameState !== 'playing' || readCountdown > 0 || cardEvent || pendingAutocorrect || hardcoreTransitionEvent) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, gameState, readCountdown, cardEvent, pendingAutocorrect, hardcoreTransitionEvent, handleTimeout]);

  const prepareDailyMatch = () => {
    sound.playBeep();
    setGameMode('daily');
    setIsHardcoreActive(false);
    setGameState('staging');
  };

  const prepareCardsMatch = () => {
    sound.playBeep();
    setGameMode('cards');
    setIsHardcoreActive(false); 
    setShuffledCardQuestions(shuffleArray(cardQuestionsData));
    setGameState('staging');
  };

  const prepareEndlessMatch = () => {
    sound.playBeep();
    setGameMode('endless');
    setIsHardcoreActive(false); 
    setShuffledPressQuestions(shuffleArray(pressQuestionsData));
    setGameState('staging');
  };

  const startDailyMatch = () => {
    clearCardTimers();
    sound.playBeep();
    sound.stopLobbyMusic();
    setGameState('playing');
    setFixtureIndex(0);
    setTimeLeft(BASE_SHOT_CLOCK);
    setReadCountdown(READING_SECONDS);
    setHistory([]);
    setCurrentKickResult(null);
    setInvalidAttempt(null);
    setPendingAutocorrect(null);
    setStrikes(0);
    setVarAvailable(true);
    setCardEvent(null);
    setHardcoreTransitionEvent(null);
    setIsTimerRunning(false);
  };

  const nextFixture = () => {
    sound.playBeep();
    setPendingAutocorrect(null);
    if (gameMode === 'daily' && fixtureIndex + 1 >= TOTAL_FIXTURES) {
      finishGame(history);
    } else {
      setCurrentKickResult(null);
      setInvalidAttempt(null);
      setFixtureIndex((prev) => prev + 1);
      setTimeLeft(totalTime);
      setReadCountdown(READING_SECONDS);
      setIsTimerRunning(false);
    }
  };

  const goToMenu = () => {
    clearCardTimers();
    sound.playBeep();
    setCardEvent(null);
    setHardcoreTransitionEvent(null);
    setGameState('menu');
    setCurrentKickResult(null);
    setPendingAutocorrect(null);
  };

  const viewTodaysResults = () => {
    sound.playBeep();
    setGameMode('daily');
    setHistory(saveData.todayHistory);
    setGameState('finished');
  };

  const commitMatchedAnswer = (matchedAnswer) => {
    setIsTimerRunning(false);
    setInvalidAttempt(null);
    setPendingAutocorrect(null);

    const isFlatMode = gameMode === 'endless';
    const kickData = {
      type: 'hit',
      meters: isFlatMode ? 15 : matchedAnswer.meters,
      tierName: isFlatMode ? 'SPOT ON (+15)' : matchedAnswer.tierName,
      tierKey: matchedAnswer.tierKey,
      tierColor: matchedAnswer.tierColor,
      banter: getNextBanter(matchedAnswer.tierKey),
      player: matchedAnswer,
      question: currentQuestion,
      allAnswers: currentQuestion.validAnswers || [],
    };

    setCurrentKickResult(kickData);
    setHistory((prev) => [...prev, kickData]);

    if (gameMode === 'endless') {
      setTimeout(() => {
        nextFixture();
      }, 1600);
    }
  };

  const shoot = (inputName, forceConfirm = false) => {
    if (gameState !== 'playing' || currentKickResult || readCountdown > 0 || cardEvent || hardcoreTransitionEvent) return;
    
    const rawGuess = inputName.trim();
    if (rawGuess) {
      logPlayerGuess(rawGuess, gameMode, currentQuestion);
    }

    const validPool = currentQuestion.validAnswers || [];
    const matchResult = findFuzzyPlayer(inputName, validPool);

    if (!matchResult) {
      setPendingAutocorrect(null);

      if (isHardcoreActive) { 
        triggerCardStrike(inputName.trim().toUpperCase(), `"${inputName.trim().toUpperCase()}" IS INCORRECT!`);
        return;
      }

      if (gameMode === 'endless') {
        sound.playInvalidBuzz();
        const wrongKick = {
          type: 'miss',
          meters: 0,
          tierName: 'SACKED IN THE MORNING',
          tierKey: 'groan',
          tierColor: '#ef4444',
          banter: `Incorrect guess "${inputName}". Sacked!`,
          question: currentQuestion,
          player: { name: inputName },
          allAnswers: validPool,
        };

        setCurrentKickResult(wrongKick);
        setHistory((prev) => {
          const updated = [...prev, wrongKick];
          setTimeout(() => {
            finishGame(updated);
          }, 2200);
          return updated;
        });
        return;
      }

      sound.playInvalidBuzz();
      setInvalidAttempt({ name: inputName, reason: 'Not a qualifying answer for this fixture!' });
      setTimeout(() => setInvalidAttempt(null), 2000);
      return;
    }

    const cleanInput = inputName.trim().toLowerCase();
    const targetName = matchResult.player.name.toLowerCase();
    const isExactOrPart = matchResult.isExact || cleanInput === targetName || targetName.includes(cleanInput);
    
    const isMultipleChoice = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0;

    if (isExactOrPart || forceConfirm || isMultipleChoice) {
      commitMatchedAnswer(matchResult.player);
    } else {
      sound.playBeep();
      setIsTimerRunning(false);
      setPendingAutocorrect({
        matchedAnswer: matchResult.player,
        rawInput: inputName
      });
    }
  };

  const cancelAutocorrect = () => {
    sound.playBeep();
    setPendingAutocorrect(null);
    setIsTimerRunning(true);
  };

  const reportMissingPostMatch = (questionPrompt, playerInput) => {
    sound.playBeep();
    logContestedAnswer(questionPrompt, playerInput || 'POST_MATCH_FLAG', 'POST_MATCH_REPORT');
  };

  return {
    gameState,
    gameMode,
    fixtureIndex,
    totalFixtures: TOTAL_FIXTURES,
    currentQuestion,
    timeLeft,
    readCountdown,
    totalTime,
    totalDistance,
    history,
    currentKickResult,
    invalidAttempt,
    pendingAutocorrect,
    strikes,
    varAvailable,
    cardEvent,
    hardcoreTransitionEvent,
    isHardcoreActive,
    triggerVarChallenge,
    reportMissingPostMatch,
    stats: saveData.stats,
    hasPlayedToday,
    shoot,
    cancelAutocorrect,
    nextFixture,
    prepareDailyMatch,
    prepareCardsMatch,
    prepareEndlessMatch,
    startDailyMatch,
    goToMenu,
    viewTodaysResults
  };
}
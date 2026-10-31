import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import questionsData from '../data/questions.json';
import { findFuzzyPlayer } from '../utils/fuzzyMatch';
import { BANTER_LINES } from '../data/banter';
import { sound } from '../utils/audio';

const SHOT_CLOCK_SECONDS = 20;
const READING_SECONDS = 3;
const TOTAL_FIXTURES = 7;

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

// LocalStorage Helpers
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

export function useGame() {
  const [gameState, setGameState] = useState('menu'); 
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SHOT_CLOCK_SECONDS);
  const [readCountdown, setReadCountdown] = useState(READING_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentKickResult, setCurrentKickResult] = useState(null);
  const [invalidAttempt, setInvalidAttempt] = useState(null);
  
  // Stats & Persistence State
  const [saveData, setSaveData] = useState(loadSaveData());
  const currentDayNum = getDayNumber();
  const hasPlayedToday = saveData.lastPlayedDay === currentDayNum;

  const todaysFixtures = useMemo(() => getTodaysFixtures(questionsData), []);

  const banterIndices = useRef({
    topBins: 0, worldie: 0, hollywoodBall: 0, throughBall: 0, tapIn: 0, timeout: 0,
  });

  const getNextBanter = (categoryKey) => {
    const pool = BANTER_LINES[categoryKey] || BANTER_LINES.tapIn;
    const currentIndex = banterIndices.current[categoryKey] || 0;
    const line = pool[currentIndex % pool.length];
    banterIndices.current[categoryKey] = currentIndex + 1;
    return line;
  };

  const currentQuestion = useMemo(() => {
    return todaysFixtures[fixtureIndex] || todaysFixtures[0] || { validAnswers: [] };
  }, [fixtureIndex, todaysFixtures]);

  // Use today's saved distance if they already played, otherwise calculate live
  const totalDistance = useMemo(() => {
    if (gameState === 'finished' && hasPlayedToday && history.length === 0) {
      return saveData.todayDistance;
    }
    return history.reduce((sum, item) => sum + (item.meters || 0), 0);
  }, [history, gameState, hasPlayedToday, saveData]);

  useEffect(() => {
    if (gameState !== 'playing' || currentKickResult) return;
    if (readCountdown > 0) {
      setIsTimerRunning(false);
      const timer = setTimeout(() => setReadCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTimerRunning(true);
    }
  }, [readCountdown, gameState, currentKickResult]);

  const handleTimeout = useCallback(() => {
    setIsTimerRunning(false);
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
  }, [currentQuestion]);

  useEffect(() => {
    if (!isTimerRunning || gameState !== 'playing' || readCountdown > 0) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, gameState, readCountdown, handleTimeout]);

  const prepareDailyMatch = () => {
    sound.playBeep();
    setGameState('staging');
  };

  const startDailyMatch = () => {
    sound.playBeep();
    sound.stopLobbyMusic();
    setGameState('playing');
    setFixtureIndex(0);
    setTimeLeft(SHOT_CLOCK_SECONDS);
    setReadCountdown(READING_SECONDS);
    setHistory([]);
    setCurrentKickResult(null);
    setInvalidAttempt(null);
    setIsTimerRunning(false);
  };

  const finishGame = (finalHistory) => {
    const finalDist = finalHistory.reduce((sum, item) => sum + (item.meters || 0), 0);
    
    // Calculate new stats
    let newStreak = saveData.stats.currentStreak;
    if (saveData.lastPlayedDay === currentDayNum - 1) {
      newStreak += 1; // Played yesterday, continue streak
    } else if (saveData.lastPlayedDay !== currentDayNum) {
      newStreak = 1; // Streak broken
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
    setGameState('finished');
    setIsTimerRunning(false);
    setCurrentKickResult(null);
  };

  const nextFixture = () => {
    sound.playBeep();
    if (fixtureIndex + 1 >= TOTAL_FIXTURES) {
      finishGame(history);
    } else {
      setCurrentKickResult(null);
      setInvalidAttempt(null);
      setFixtureIndex((prev) => prev + 1);
      setTimeLeft(SHOT_CLOCK_SECONDS);
      setReadCountdown(READING_SECONDS);
      setIsTimerRunning(false);
    }
  };

  const goToMenu = () => {
    sound.playBeep();
    setGameState('menu');
    setCurrentKickResult(null);
  };

  const viewTodaysResults = () => {
    sound.playBeep();
    setHistory(saveData.todayHistory);
    setGameState('finished');
  };

  const shoot = (inputName) => {
    if (!isTimerRunning || gameState !== 'playing' || currentKickResult || readCountdown > 0) return;
    const validPool = currentQuestion.validAnswers || [];
    const matchedAnswer = findFuzzyPlayer(inputName, validPool);

    if (!matchedAnswer) {
      sound.playInvalidBuzz();
      setInvalidAttempt({ name: inputName, reason: 'Not a qualifying answer for this fixture!' });
      setTimeout(() => setInvalidAttempt(null), 2000);
      return;
    }

    setIsTimerRunning(false);
    setInvalidAttempt(null);

    const kickData = {
      type: 'hit',
      meters: matchedAnswer.meters,
      tierName: matchedAnswer.tierName,
      tierKey: matchedAnswer.tierKey,
      tierColor: matchedAnswer.tierColor,
      banter: getNextBanter(matchedAnswer.tierKey),
      player: matchedAnswer,
      question: currentQuestion,
      allAnswers: validPool,
    };

    setCurrentKickResult(kickData);
    setHistory((prev) => {
      const updated = [...prev, kickData];
      if (fixtureIndex + 1 >= TOTAL_FIXTURES) {
        // We defer finishGame to nextFixture so the user sees the reveal first
      }
      return updated;
    });
  };

  return {
    gameState,
    fixtureIndex,
    totalFixtures: TOTAL_FIXTURES,
    currentQuestion,
    timeLeft,
    readCountdown,
    totalTime: SHOT_CLOCK_SECONDS,
    totalDistance,
    history,
    currentKickResult,
    invalidAttempt,
    stats: saveData.stats,
    hasPlayedToday,
    shoot,
    nextFixture,
    prepareDailyMatch,
    startDailyMatch,
    goToMenu,
    viewTodaysResults
  };
}
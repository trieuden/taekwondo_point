import React, { useState, useEffect } from 'react';
import './Scoreboard.css';

function Scoreboard() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync State from Control Panel
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return saved;
      }
    }
    return defaultValue;
  };

  const [redName, setRedName] = useState(() => loadState('redName', 'RED'));
  const [redScore, setRedScore] = useState(() => loadState('redScore', 0));
  const [redGam, setRedGam] = useState(() => loadState('redGam', 0));
  const [blueName, setBlueName] = useState(() => loadState('blueName', 'BLUE'));
  const [blueScore, setBlueScore] = useState(() => loadState('blueScore', 0));
  const [blueGam, setBlueGam] = useState(() => loadState('blueGam', 0));
  const [matchNumber, setMatchNumber] = useState(() => loadState('matchNumber', '1'));
  const [timeRemaining, setTimeRemaining] = useState(() => loadState('timeRemaining', 30));
  
  // New States for Round and Winner
  const [currentRound, setCurrentRound] = useState(() => loadState('currentRound', 1));
  const [winnerMessage, setWinnerMessage] = useState(() => loadState('winnerMessage', ''));
  const [winnerReason, setWinnerReason] = useState(() => loadState('winnerReason', ''));
  const [winnerColor, setWinnerColor] = useState(() => loadState('winnerColor', '#ffd700'));
  const [redRoundScores, setRedRoundScores] = useState(() => loadState('redRoundScores', [0, 0, 0]));
  const [blueRoundScores, setBlueRoundScores] = useState(() => loadState('blueRoundScores', [0, 0, 0]));

  useEffect(() => {
    const handleStorageChange = () => {
      setRedName(loadState('redName', 'RED'));
      setRedScore(loadState('redScore', 0));
      setRedGam(loadState('redGam', 0));
      setBlueName(loadState('blueName', 'BLUE'));
      setBlueScore(loadState('blueScore', 0));
      setBlueGam(loadState('blueGam', 0));
      setMatchNumber(loadState('matchNumber', '1'));
      setTimeRemaining(loadState('timeRemaining', 30));
      setCurrentRound(loadState('currentRound', 1));
      setWinnerMessage(loadState('winnerMessage', ''));
      setWinnerReason(loadState('winnerReason', ''));
      setWinnerColor(loadState('winnerColor', '#ffd700'));
      setRedRoundScores(loadState('redRoundScores', [0, 0, 0]));
      setBlueRoundScores(loadState('blueRoundScores', [0, 0, 0]));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="scoreboard-container">
      {/* Icon fullscreen */}
      <button className="fullscreen-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}>
        {isFullscreen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        )}
      </button>

      {/* Blue Side */}
      <div className="side blue-side">
        <div className="team-name">{blueName || 'BLUE'}</div>
        <div className="score">{blueScore}</div>
        <div className="gam-score">Gam {blueGam}</div>
        <div className="round-scores">
          R1 {blueRoundScores[0]} R2 {blueRoundScores[1]} R3 {blueRoundScores[2]}
        </div>
      </div>

      {/* Center Console */}
      <div className="center-console">
        <div className="match-number">MATCH {matchNumber}</div>
        <div className="timer-box">
          <div className="timer">{formatTime(timeRemaining)}</div>
        </div>
        <div className="round-number">ROUND {currentRound}</div>
      </div>

      {/* Red Side */}
      <div className="side red-side">
        <div className="team-name">{redName || 'RED'}</div>
        <div className="score">{redScore}</div>
        <div className="gam-score">Gam {redGam}</div>
        <div className="round-scores">
          R1 {redRoundScores[0]} R2 {redRoundScores[1]} R3 {redRoundScores[2]}
        </div>
      </div>

      {/* Winner Popup */}
      {winnerMessage && (
        <div className="winner-overlay">
          <div 
             className="winner-popup" 
             style={{ 
               backgroundColor: winnerColor,
               color: winnerColor === '#ffd700' ? '#000' : '#fff'
             }}
          >
             <div>{winnerMessage}</div>
             {winnerReason && <div style={{ fontSize: '2rem', marginTop: '20px', fontWeight: 'normal' }}>Lý do: {winnerReason}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Scoreboard;

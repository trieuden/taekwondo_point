import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './Scoreboard.css';

// Connect to the Socket.io server running on port 3001 of the same host
const socket = io(`https://taekwondo-point.onrender.com`);

function Scoreboard() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [redName, setRedName] = useState('RED');
  const [redScore, setRedScore] = useState(0);
  const [redGam, setRedGam] = useState(0);
  const [blueName, setBlueName] = useState('BLUE');
  const [blueScore, setBlueScore] = useState(0);
  const [blueGam, setBlueGam] = useState(0);
  const [matchNumber, setMatchNumber] = useState('1');
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // New States for Round and Winner
  const [currentRound, setCurrentRound] = useState(1);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [winnerReason, setWinnerReason] = useState('');
  const [winnerColor, setWinnerColor] = useState('#ffd700');
  const [redRoundScores, setRedRoundScores] = useState([0, 0, 0]);
  const [blueRoundScores, setBlueRoundScores] = useState([0, 0, 0]);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Listen for state broadcasts from the server (coming from Control Panel)
    const handleStateUpdate = (state) => {
      if(state.redName !== undefined) setRedName(state.redName);
      if(state.redScore !== undefined) setRedScore(state.redScore);
      if(state.redGam !== undefined) setRedGam(state.redGam);
      if(state.blueName !== undefined) setBlueName(state.blueName);
      if(state.blueScore !== undefined) setBlueScore(state.blueScore);
      if(state.blueGam !== undefined) setBlueGam(state.blueGam);
      if(state.matchNumber !== undefined) setMatchNumber(state.matchNumber);
      if(state.timeRemaining !== undefined) setTimeRemaining(state.timeRemaining);
      if(state.currentRound !== undefined) setCurrentRound(state.currentRound);
      if(state.winnerMessage !== undefined) setWinnerMessage(state.winnerMessage);
      if(state.winnerReason !== undefined) setWinnerReason(state.winnerReason);
      if(state.winnerColor !== undefined) setWinnerColor(state.winnerColor);
      if(state.redRoundScores !== undefined) setRedRoundScores(state.redRoundScores);
      if(state.blueRoundScores !== undefined) setBlueRoundScores(state.blueRoundScores);
    };

    socket.on('stateUpdate', handleStateUpdate);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('stateUpdate', handleStateUpdate);
    };
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

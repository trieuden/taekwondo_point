import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './ControlPanel.css';

// Connect to the Socket.io server running on port 3001 of the same host
const socket = io(`https://taekwondo-point.onrender.com`);

const ControlPanel = () => {
  // We'll manage state locally, but also listen for server sync initially
  // to grab any existing state if the page is refreshed.
  const [isConnected, setIsConnected] = useState(false);

  // Red State
  const [redName, setRedName] = useState('BẢO');
  const [redUnit, setRedUnit] = useState('');
  const [redScore, setRedScore] = useState(0);
  const [redGam, setRedGam] = useState(0);

  // Blue State
  const [blueName, setBlueName] = useState('NAM');
  const [blueUnit, setBlueUnit] = useState('');
  const [blueScore, setBlueScore] = useState(0);
  const [blueGam, setBlueGam] = useState(0);

  // Match State
  const [matchNumber, setMatchNumber] = useState('1');
  const [roundTimeConfig, setRoundTimeConfig] = useState(30);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // New States for Round and Winner Tracking
  const [currentRound, setCurrentRound] = useState(1);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [winnerReason, setWinnerReason] = useState('');
  const [winnerColor, setWinnerColor] = useState('#ffd700');
  const [redRoundScores, setRedRoundScores] = useState([0, 0, 0]);
  const [blueRoundScores, setBlueRoundScores] = useState([0, 0, 0]);

  // Initial sync from server and connection tracking
  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('stateUpdate', (state) => {
       // Optional: We can listen to sync from other controls, 
       // but typically ControlPanel is the source of truth.
       // We'll update our local state just in case another device changed it.
       if(state.redName !== undefined) setRedName(state.redName);
       if(state.redScore !== undefined) setRedScore(state.redScore);
       if(state.redGam !== undefined) setRedGam(state.redGam);
       if(state.blueName !== undefined) setBlueName(state.blueName);
       if(state.blueScore !== undefined) setBlueScore(state.blueScore);
       if(state.blueGam !== undefined) setBlueGam(state.blueGam);
       if(state.matchNumber !== undefined) setMatchNumber(state.matchNumber);
       if(state.roundTimeConfig !== undefined) setRoundTimeConfig(state.roundTimeConfig);
       if(state.timeRemaining !== undefined) setTimeRemaining(state.timeRemaining);
       if(state.isTimerRunning !== undefined) setIsTimerRunning(state.isTimerRunning);
       if(state.currentRound !== undefined) setCurrentRound(state.currentRound);
       if(state.winnerMessage !== undefined) setWinnerMessage(state.winnerMessage);
       if(state.winnerReason !== undefined) setWinnerReason(state.winnerReason);
       if(state.winnerColor !== undefined) setWinnerColor(state.winnerColor);
       if(state.redRoundScores !== undefined) setRedRoundScores(state.redRoundScores);
       if(state.blueRoundScores !== undefined) setBlueRoundScores(state.blueRoundScores);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('stateUpdate');
    };
  }, []);

  // Broadcast state via Socket.io whenever it changes locally
  useEffect(() => {
    const stateObj = {
      redName, redUnit, redScore, redGam,
      blueName, blueUnit, blueScore, blueGam,
      matchNumber, roundTimeConfig, timeRemaining, isTimerRunning,
      currentRound, winnerMessage, winnerReason, winnerColor,
      redRoundScores, blueRoundScores
    };
    socket.emit('updateState', stateObj);
  }, [redName, redUnit, redScore, redGam, blueName, blueUnit, blueScore, blueGam, matchNumber, roundTimeConfig, timeRemaining, isTimerRunning, currentRound, winnerMessage, winnerReason, winnerColor, redRoundScores, blueRoundScores]);

  // Extract winner logic into a reusable function
  const endRoundWithWinner = (winnerRed, reason = '') => {
    setIsTimerRunning(false);
    
    let winnerMsg = '';
    let winColor = '#ffd700';
    let finalRedRounds = [...redRoundScores];
    let finalBlueRounds = [...blueRoundScores];

    const roundIdx = currentRound - 1;

    // Use `winnerRed` explicitly, or fallback to score logic if null/undefined
    const isRedWin = winnerRed !== undefined && winnerRed !== null ? winnerRed : redScore > blueScore;
    const isBlueWin = winnerRed !== undefined && winnerRed !== null ? !winnerRed : blueScore > redScore;

    if (isRedWin) {
      winnerMsg = `${redName || 'RED'} THẮNG HIỆP ${currentRound}`;
      winColor = '#f44336';
      if (roundIdx >= 0 && roundIdx < 3) finalRedRounds[roundIdx] = 1;
    } else if (isBlueWin) {
      winnerMsg = `${blueName || 'BLUE'} THẮNG HIỆP ${currentRound}`;
      winColor = '#2196f3';
      if (roundIdx >= 0 && roundIdx < 3) finalBlueRounds[roundIdx] = 1;
    } else {
      winnerMsg = `HIỆP ${currentRound} KẾT QUẢ HÒA`;
      winColor = '#ffd700'; // Draw
    }
    
    setRedRoundScores(finalRedRounds);
    setBlueRoundScores(finalBlueRounds);

    const redTotalWins = finalRedRounds.reduce((a, b) => a + b, 0);
    const blueTotalWins = finalBlueRounds.reduce((a, b) => a + b, 0);

    if (redTotalWins >= 2 || (currentRound >= 3 && redTotalWins > blueTotalWins)) {
      winnerMsg = `${redName || 'RED'} CHIẾN THẮNG CHUNG CUỘC!`;
      winColor = '#f44336';
    } else if (blueTotalWins >= 2 || (currentRound >= 3 && blueTotalWins > redTotalWins)) {
      winnerMsg = `${blueName || 'BLUE'} CHIẾN THẮNG CHUNG CUỘC!`;
      winColor = '#2196f3';
    } else if (currentRound >= 3 && redTotalWins === blueTotalWins) {
       winnerMsg = `TRẬN ĐẤU HÒA CHUNG CUỘC!`;
       winColor = '#ffd700';
    }

    setWinnerColor(winColor);
    setWinnerMessage(winnerMsg);
    setWinnerReason(reason);
  };

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      clearInterval(interval);
      endRoundWithWinner(null); // Determine by score
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, redScore, blueScore, redName, blueName, currentRound, redRoundScores, blueRoundScores]);

  const updateRedScore = (val) => setRedScore((prev) => Math.max(0, prev + val));
  const updateBlueScore = (val) => setBlueScore((prev) => Math.max(0, prev + val));

  // Gam-jeom: adds 1 point to opponent and 1 gam-jeom token to self
  const handleRedGamJeom = () => {
    if (winnerMessage) return; // don't allow action if round already ended
    const newGam = redGam + 1;
    setRedGam(newGam);
    updateBlueScore(1);
    
    if (newGam >= 5) {
      // 5 gam-jeoms = opponent (Blue) wins
      setTimeout(() => endRoundWithWinner(false, 'Đối thủ nhận 5 điểm Gam, thẻ phạt tối đa'), 50);
    }
  };

  const handleBlueGamJeom = () => {
    if (winnerMessage) return;
    const newGam = blueGam + 1;
    setBlueGam(newGam);
    updateRedScore(1);

    if (newGam >= 5) {
      // 5 gam-jeoms = opponent (Red) wins
      setTimeout(() => endRoundWithWinner(true, 'Đối thủ nhận 5 điểm Gam, thẻ phạt tối đa'), 50);
    }
  };

  return (
    <div className="control-container">
      <header className="control-header">
        TAEKWONDO – BÀN THƯ KÝ
      </header>

      <div className="control-main">
        {/* RED PANEL */}
        <div className="panel red-panel">
          <h2 className="panel-title">RED</h2>
          <div className="input-group">
            <input 
              type="text" 
              value={redName} 
              onChange={(e) => setRedName(e.target.value)} 
              placeholder="Tên" 
            />
          </div>
          <div className="input-group">
            <input 
              type="text" 
              value={redUnit} 
              onChange={(e) => setRedUnit(e.target.value)} 
              placeholder="Đơn vị" 
            />
          </div>
          
          <div className="buttons-grid">
            <button onClick={() => updateRedScore(1)}>+1</button>
            <button onClick={() => updateRedScore(2)}>+2</button>
            <button onClick={() => updateRedScore(3)}>+3</button>
            <button onClick={() => updateRedScore(4)}>+4</button>
            <button onClick={() => updateRedScore(5)}>+5</button>
            <button onClick={() => updateRedScore(6)}>+6</button>
          </div>
          <div className="action-buttons">
            <button className="square-btn" onClick={() => updateRedScore(-1)}>-1</button>
            <button className="gam-btn" onClick={handleRedGamJeom}>Gam-jeom</button>
            <button className="timeout-btn">TIME OUT</button>
          </div>
        </div>

        {/* BLUE PANEL */}
        <div className="panel blue-panel">
          <h2 className="panel-title">BLUE</h2>
          <div className="input-group">
            <input 
              type="text" 
              value={blueName} 
              onChange={(e) => setBlueName(e.target.value)} 
              placeholder="Tên" 
            />
          </div>
          <div className="input-group">
            <input 
              type="text" 
              value={blueUnit} 
              onChange={(e) => setBlueUnit(e.target.value)} 
              placeholder="Đơn vị" 
            />
          </div>

          <div className="buttons-grid">
            <button onClick={() => updateBlueScore(1)}>+1</button>
            <button onClick={() => updateBlueScore(2)}>+2</button>
            <button onClick={() => updateBlueScore(3)}>+3</button>
            <button onClick={() => updateBlueScore(4)}>+4</button>
            <button onClick={() => updateBlueScore(5)}>+5</button>
            <button onClick={() => updateBlueScore(6)}>+6</button>
          </div>
          <div className="action-buttons">
            <button className="square-btn" onClick={() => updateBlueScore(-1)}>-1</button>
            <button className="gam-btn" onClick={handleBlueGamJeom}>Gam-jeom</button>
            <button className="timeout-btn">TIME OUT</button>
          </div>
        </div>
      </div>

      <div className="control-bottom">
        <div className="bottom-row">
          <label>MATCH</label>
          <input 
            type="text" 
            className="flex-input" 
            value={matchNumber} 
            onChange={(e) => setMatchNumber(e.target.value)} 
          />
          <label>ROUND TIME</label>
        </div>
        
        <div className="bottom-row">
          <label>(giây)</label>
          <input 
            type="number" 
            className="flex-input" 
            value={roundTimeConfig} 
            onChange={(e) => {
              setRoundTimeConfig(e.target.value);
              if (!isTimerRunning) {
                setTimeRemaining(e.target.value);
              }
            }} 
          />
        </div>

        <div className="bottom-controls">
          <button onClick={() => { 
            if (timeRemaining > 0 && !winnerMessage) setIsTimerRunning(true); 
          }}>START</button>
          <button onClick={() => setIsTimerRunning(false)}>STOP</button>
          <button 
             onClick={() => { 
                if (winnerMessage) {
                   if (winnerMessage.includes('CHUNG CUỘC')) {
                      alert("Trận đấu đã kết thúc! Vui lòng ấn RESET MATCH để bắt đầu trận mới.");
                      return;
                   }

                   setWinnerMessage(''); // clear popup
                   setWinnerReason(''); 
                   setIsTimerRunning(false); 
                   setTimeRemaining(roundTimeConfig); 
                   if (currentRound < 3) setCurrentRound(c => c + 1);
                   
                   // Reset scores for next round
                   setRedScore(0);
                   setBlueScore(0);
                   setRedGam(0);
                   setBlueGam(0);
                } else {
                   alert("Chưa có kết quả hiệp đấu để sang vòng tiếp theo!");
                }
             }}
             style={{ backgroundColor: winnerMessage && !winnerMessage.includes('CHUNG CUỘC') ? '#ffeb3b' : '#f0f0f0' }}
          >NEXT ROUND</button>
          <button onClick={() => {
            setIsTimerRunning(false);
            setTimeRemaining(roundTimeConfig);
            setCurrentRound(1);
            setRedScore(0);
            setBlueScore(0);
            setRedGam(0);
            setBlueGam(0);
            setWinnerMessage('');
            setWinnerReason('');
            setWinnerColor('#ffd700');
            setRedRoundScores([0,0,0]);
            setBlueRoundScores([0,0,0]);
          }}>RESET MATCH</button>
          <button>CẬP NHẬT TÊN</button>
        </div>

        <div className="bottom-footer">
          <button onClick={() => window.open('/scoreboard', '_blank')}>MỞ BẢNG ĐIỂM</button>
          <button>LỊCH SỬ</button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

import React, { useState, useEffect } from 'react';
import './ControlPanel.css';

const ControlPanel = () => {
  // Load state from localStorage or use defaults
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

  // Red State
  const [redName, setRedName] = useState(() => loadState('redName', 'BẢO'));
  const [redUnit, setRedUnit] = useState(() => loadState('redUnit', ''));
  const [redScore, setRedScore] = useState(() => loadState('redScore', 0));
  const [redGam, setRedGam] = useState(() => loadState('redGam', 0));

  // Blue State
  const [blueName, setBlueName] = useState(() => loadState('blueName', 'NAM'));
  const [blueUnit, setBlueUnit] = useState(() => loadState('blueUnit', ''));
  const [blueScore, setBlueScore] = useState(() => loadState('blueScore', 0));
  const [blueGam, setBlueGam] = useState(() => loadState('blueGam', 0));

  // Match State
  const [matchNumber, setMatchNumber] = useState(() => loadState('matchNumber', '1'));
  const [roundTimeConfig, setRoundTimeConfig] = useState(() => loadState('roundTimeConfig', 30));
  const [timeRemaining, setTimeRemaining] = useState(() => loadState('timeRemaining', 30));
  const [isTimerRunning, setIsTimerRunning] = useState(() => loadState('isTimerRunning', false));

  // New States for Round and Winner Tracking
  const [currentRound, setCurrentRound] = useState(() => loadState('currentRound', 1));
  const [winnerMessage, setWinnerMessage] = useState(() => loadState('winnerMessage', ''));
  const [winnerReason, setWinnerReason] = useState(() => loadState('winnerReason', ''));
  const [winnerColor, setWinnerColor] = useState(() => loadState('winnerColor', '#ffd700'));
  const [redRoundScores, setRedRoundScores] = useState(() => loadState('redRoundScores', [0, 0, 0]));
  const [blueRoundScores, setBlueRoundScores] = useState(() => loadState('blueRoundScores', [0, 0, 0]));

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('redName', JSON.stringify(redName));
    localStorage.setItem('redUnit', JSON.stringify(redUnit));
    localStorage.setItem('redScore', JSON.stringify(redScore));
    localStorage.setItem('redGam', JSON.stringify(redGam));
    localStorage.setItem('blueName', JSON.stringify(blueName));
    localStorage.setItem('blueUnit', JSON.stringify(blueUnit));
    localStorage.setItem('blueScore', JSON.stringify(blueScore));
    localStorage.setItem('blueGam', JSON.stringify(blueGam));
    localStorage.setItem('matchNumber', JSON.stringify(matchNumber));
    localStorage.setItem('roundTimeConfig', JSON.stringify(roundTimeConfig));
    localStorage.setItem('timeRemaining', JSON.stringify(timeRemaining));
    localStorage.setItem('isTimerRunning', JSON.stringify(isTimerRunning));
    localStorage.setItem('currentRound', JSON.stringify(currentRound));
    localStorage.setItem('winnerMessage', JSON.stringify(winnerMessage));
    localStorage.setItem('winnerReason', JSON.stringify(winnerReason));
    localStorage.setItem('winnerColor', JSON.stringify(winnerColor));
    localStorage.setItem('redRoundScores', JSON.stringify(redRoundScores));
    localStorage.setItem('blueRoundScores', JSON.stringify(blueRoundScores));
    // Trigger storage event manually for same-window testing (optional, usually storage event fires in other windows)
    window.dispatchEvent(new Event('storage'));
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

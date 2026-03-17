import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Scoreboard, ControlPanel } from './app/index';
import './App.css';

// A simple home page pointing to the scoreboard and control panel
function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Taekwondo Point Match</h1>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/scoreboard" style={{ fontSize: '20px', color: '#2196f3' }}>
          Open Scoreboard
        </Link>
        <Link to="/control" style={{ fontSize: '20px', color: '#f44336' }}>
          Open Control Panel
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/control" element={<ControlPanel />} />
      </Routes>
    </Router>
  );
}

export default App;

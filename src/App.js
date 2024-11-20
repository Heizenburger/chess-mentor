import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChessMentorHome from './ChessMentorHome';
import ChessExplorer from './ChessExplorer';
import PuzzlePage from './PuzzlePage';
import PlayWithComputer from './PlayWithComputer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChessMentorHome />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/computer" element={<PlayWithComputer />} />
      </Routes>
    </Router>
  );
}

export default App;

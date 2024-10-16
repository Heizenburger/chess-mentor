import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChessMentorHome from './ChessMentorHome';
import PuzzlePage from './PuzzlePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChessMentorHome />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
      </Routes>
    </Router>
  );
}

export default App;

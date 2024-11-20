import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Slider
} from '@mui/material';

// Difficulty levels with different move selection strategies
const DIFFICULTY_LEVELS = [
  { 
    level: 1, 
    description: 'Easy',
    moveStrategy: (moves) => moves[Math.floor(Math.random() * moves.length)]
  },
  { 
    level: 2, 
    description: 'Medium',
    moveStrategy: (moves) => {
      // Prefer captures and checks
      const captureMoves = moves.filter(move => move.includes('x'));
      const checkMoves = moves.filter(move => move.includes('+'));
      
      if (captureMoves.length > 0) return captureMoves[Math.floor(Math.random() * captureMoves.length)];
      if (checkMoves.length > 0) return checkMoves[Math.floor(Math.random() * checkMoves.length)];
      
      return moves[Math.floor(Math.random() * moves.length)];
    }
  },
  { 
    level: 3, 
    description: 'Hard',
    moveStrategy: (moves) => {
      // Prioritize moves that develop pieces or control center
      const centerMoves = moves.filter(move => 
        ['e4', 'd4', 'e5', 'd5'].some(square => move.includes(square))
      );
      
      if (centerMoves.length > 0) return centerMoves[Math.floor(Math.random() * centerMoves.length)];
      
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }
];

const PlayWithComputer = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('white');
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(2);
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    // Check game status after each move
    if (isGameOver()) {
      determineGameOutcome();
    }

    // Make computer move if it's computer's turn after game starts
    if (gameStarted && 
        ((playerColor === 'white' && game.turn() === 'b') || 
         (playerColor === 'black' && game.turn() === 'w'))) {
      makeComputerMove();
    }
  }, [game, playerColor, gameStarted]);

  // Custom game over check
  const isGameOver = () => {
    return (
      game.isCheckmate() || 
      game.isStalemate() || 
      game.isThreefoldRepetition() || 
      game.isInsufficientMaterial() || 
      game.isDraw()
    );
  };

  // Determine game outcome
  const determineGameOutcome = () => {
    if (game.isCheckmate()) {
      setGameStatus(game.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!');
    } else if (game.isStalemate()) {
      setGameStatus('Stalemate!');
    } else if (game.isThreefoldRepetition()) {
      setGameStatus('Draw by threefold repetition!');
    } else if (game.isInsufficientMaterial()) {
      setGameStatus('Draw by insufficient material!');
    } else if (game.isDraw()) {
      setGameStatus('Draw!');
    }
  };

  const makeComputerMove = () => {
    const gameCopy = new Chess(game.fen());
    const possibleMoves = gameCopy.moves();

    if (possibleMoves.length > 0) {
      // Select move based on difficulty level
      const difficultyConfig = DIFFICULTY_LEVELS.find(d => d.level === difficulty);
      const selectedMove = difficultyConfig.moveStrategy(possibleMoves);
      
      gameCopy.move(selectedMove);
      setGame(gameCopy);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const gameCopy = new Chess(game.fen());

    try {
      // Ensure it's the player's turn
      const isPlayerTurn = 
        (playerColor === 'white' && gameCopy.turn() === 'w') ||
        (playerColor === 'black' && gameCopy.turn() === 'b');

      if (!isPlayerTurn) return false;

      // Attempt to make the move
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Default promotion to queen
      });

      // If move is valid, update game state
      if (move) {
        setGame(gameCopy);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const startGame = () => {
    setGame(new Chess());
    setGameStarted(true);
    setGameStatus('');
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameStatus('');
  };

  // Game setup dialog
  if (!gameStarted) {
    return (
      <Dialog open={true} onClose={() => {}}>
        <DialogTitle>Chess Game Setup</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <Typography>Choose Your Color</Typography>
            <div className="flex space-x-4 my-2">
              <Button 
                variant={playerColor === 'white' ? 'contained' : 'outlined'}
                onClick={() => setPlayerColor('white')}
              >
                White
              </Button>
              <Button 
                variant={playerColor === 'black' ? 'contained' : 'outlined'}
                onClick={() => setPlayerColor('black')}
              >
                Black
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Typography>Difficulty Level</Typography>
            <Slider
              value={difficulty}
              min={1}
              max={3}
              marks
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => DIFFICULTY_LEVELS[value - 1].description}
              onChange={(e, newValue) => setDifficulty(newValue)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={startGame} color="primary">
            Start Game
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {gameStatus && (
        <div style={{ 
          marginBottom: '1rem', 
          textAlign: 'center',
          width: '100%'
        }}>
          <Typography variant="h5" color="error">
            {gameStatus}
          </Typography>
        </div>
      )}
      <div style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={playerColor}
          boardWidth={600}
        />
        <div style={{ 
          marginTop: '1rem'
        }}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={resetGame}
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayWithComputer;

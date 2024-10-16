import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const PuzzlePage = () => {
  const [game, setGame] = useState(new Chess());
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [puzzles, setPuzzles] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [highlightSquares, setHighlightSquares] = useState({});
  const [userRating, setUserRating] = useState('');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  useEffect(() => {
    if (isRatingSubmitted) {
      fetchPuzzles();
    }
  }, [isRatingSubmitted]);

  useEffect(() => {
    if (puzzles.length > 0 && !currentPuzzle) {
      loadNextPuzzle();
    }
  }, [puzzles, currentPuzzle]);

  const fetchPuzzles = async () => {
    try {
      const response = await fetch(`https://lichess.org/api/puzzle/daily?max=5&rating=${userRating}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/x-ndjson',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const puzzlesData = text.trim().split('\n').map(JSON.parse);
      setPuzzles(puzzlesData);
    } catch (error) {
      console.error('Error fetching puzzles:', error);
      setMessage(`Error loading puzzles: ${error.message}. Please try again.`);
    }
  };

  const loadNextPuzzle = () => {
    if (puzzles.length > 0) {
      const nextPuzzle = puzzles.shift();
      setPuzzles([...puzzles]);
      setCurrentPuzzle(nextPuzzle);

      if (nextPuzzle && nextPuzzle.game && nextPuzzle.puzzle) {
        const tempGame = new Chess();
        try {
          tempGame.loadPgn(nextPuzzle.game.pgn);
          const puzzleFen = tempGame.fen();
          const newGame = new Chess(puzzleFen);
          setGame(newGame);
          setCurrentMoveIndex(0);
          setMessage("Your turn. Make the best move!");
          setHighlightSquares({});
        } catch (error) {
          console.error('Error setting up puzzle:', error);
          setMessage("Error loading puzzle. Skipping to next.");
          loadNextPuzzle();
        }
      } else {
        console.error('Invalid puzzle data:', nextPuzzle);
        setMessage("Error loading puzzle. Skipping to next.");
        loadNextPuzzle();
      }
    } else {
      fetchPuzzles();
    }
  };

  const onPieceDragBegin = (piece, sourceSquare) => {
    const moves = game.moves({ square: sourceSquare, verbose: true });
    const newHighlightSquares = {};
    moves.forEach(move => {
      newHighlightSquares[move.to] = { background: 'rgba(255, 255, 0, 0.4)' };
    });
    setHighlightSquares(newHighlightSquares);
  };

  const onPieceDragEnd = () => {
    setHighlightSquares({});
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity
    });

    if (move === null) return false; // illegal move

    setGame(new Chess(game.fen()));

    if (currentPuzzle && currentPuzzle.puzzle && currentPuzzle.puzzle.solution && currentMoveIndex < currentPuzzle.puzzle.solution.length) {
      const expectedMove = currentPuzzle.puzzle.solution[currentMoveIndex];
      if (move.from + move.to === expectedMove) {
        setCurrentMoveIndex(currentMoveIndex + 1);
        setMessage("Correct! Keep going.");

        // Make the next puzzle move if there is one
        if (currentMoveIndex + 1 < currentPuzzle.puzzle.solution.length) {
          setTimeout(() => {
            const nextMove = currentPuzzle.puzzle.solution[currentMoveIndex + 1];
            game.move({
              from: nextMove.slice(0, 2),
              to: nextMove.slice(2, 4),
              promotion: nextMove[4] // This will be undefined if no promotion
            });
            setGame(new Chess(game.fen()));
            setCurrentMoveIndex(currentMoveIndex + 2);
            setMessage("Your turn again. Find the best move!");
          }, 500);
        } else {
          setMessage("Congratulations! You've solved the puzzle!");
          setTimeout(loadNextPuzzle, 2000); // Load next puzzle after 2 seconds
        }
      } else {
        setMessage("Incorrect move. Try again!");
        setTimeout(() => {
          game.undo();
          setGame(new Chess(game.fen()));
        }, 500);
      }
    }

    return true;
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    setIsRatingSubmitted(true);
  };

  if (!isRatingSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Chess Puzzles</h1>
        <form onSubmit={handleRatingSubmit} className="mb-4">
          <input
            type="number"
            value={userRating}
            onChange={(e) => setUserRating(e.target.value)}
            placeholder="Enter your chess rating"
            className="px-4 py-2 border rounded mr-2"
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Start Puzzles
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Chess Puzzles</h1>
      <div className="w-[480px] h-[480px] mb-4">
        <Chessboard 
          position={game.fen()} 
          onPieceDrop={onDrop}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          customSquareStyles={highlightSquares}
        />
      </div>
      <p className="text-xl mb-4">{message}</p>
      {currentPuzzle && currentPuzzle.puzzle && (
        <p className="text-lg">Puzzle Rating: {currentPuzzle.puzzle.rating}</p>
      )}
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={loadNextPuzzle}
      >
        Next Puzzle
      </button>
    </div>
  );
};

export default PuzzlePage;
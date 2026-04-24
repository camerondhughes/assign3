import { useState } from 'react';

const CENTER = 4;
const ADJACENCY = {
  0: [1, 3, 4],
  1: [0, 2, 3, 4, 5],
  2: [1, 4, 5],
  3: [0, 1, 4, 6, 7],
  4: [0, 1, 2, 3, 5, 6, 7, 8],
  5: [1, 2, 4, 7, 8],
  6: [3, 4, 7],
  7: [3, 4, 5, 6, 8],
  8: [4, 5, 7],
};

function countPieces(squares, player) {
  return squares.filter(s => s === player).length;
}

function isMovementPhase(squares, player) {
  return countPieces(squares, player) >= 3;
}

function playerHasCenter(squares, player) {
  return squares[CENTER] === player;
}

function wouldWin(squares, from, to, player) {
  const next = squares.slice();
  next[to] = player;
  if (from !== null) next[from] = null;
  return calculateWinner(next) === player;
}

function Square({ value, onSquareClick, isSelected }) {
  return (
    <button className={"square" + (isSelected ? ' selected' : '')} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, selectedIndex, onSelect }) {
  const player = xIsNext ? 'X' : 'O';
  const inMovementPhase = isMovementPhase(squares, player);

  function handleClick(i) {
    if (calculateWinner(squares)) return;

    if (!inMovementPhase) {
      if (squares[i]) return;
      const nextSquares = squares.slice();
      nextSquares[i] = player;
      onPlay(nextSquares);
      return;
    }

    if (selectedIndex === null) {
      if (squares[i] !== player) return;

      onSelect(i);
    } else {
      if (i === selectedIndex) {
        onSelect(null);
        return;
      }

      if (squares[i] || !ADJACENCY[selectedIndex].includes(i)) {
        onSelect(null);
        return;
      }

      if (playerHasCenter(squares, player)) {
        const vacatesCenter = selectedIndex === CENTER;
        const wins = wouldWin(squares, selectedIndex, i, player);
        if (!vacatesCenter && !wins) {
          onSelect(null);
          return;
        }
      }

      const nextSquares = squares.slice();
      nextSquares[selectedIndex] = null;
      nextSquares[i] = player;
      onSelect(null);
      onPlay(nextSquares);
    }
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (inMovementPhase && selectedIndex !== null) {
    status = player + ": move selected piece (click destination)";;
  } else if (inMovementPhase) {
    status = player + ": select a piece to move";
  } else {
    status = 'Next player: ' + player;
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {[0, 1, 2].map(i => (
          <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} isSelected={selectedIndex === i}/>
        ))}
      </div>
      <div className="board-row">
        {[3, 4, 5].map(i => (
          <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} isSelected={selectedIndex === i}/>
        ))}
      </div>
      <div className="board-row">
        {[6, 7, 8].map(i => (
          <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} isSelected={selectedIndex === i}/>
        ))}
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setSelectedIndex(null);
  }

  const moves = history.map((squares, move) => {
    const description = move > 0 ? 'Go to move ' + move : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} selectedIndex={selectedIndex} onSelect={setSelectedIndex}/>
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
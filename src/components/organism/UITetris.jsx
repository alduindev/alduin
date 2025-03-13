import React, { useState, useEffect } from "react";

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  J: [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};
const COLORS = ["bg-gray-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500", "bg-orange-500", "bg-red-500", "bg-green-500"];

const getRandomPiece = () => {
  const keys = Object.keys(SHAPES);
  const shape = keys[Math.floor(Math.random() * keys.length)];
  return { shape, blocks: SHAPES[shape], color: COLORS[keys.indexOf(shape) + 1] };
};

const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const checkCollision = (grid, piece, pos) => {
  return piece.blocks.some((row, y) =>
    row.some((cell, x) =>
      cell &&
      (pos.y + y >= ROWS || pos.x + x < 0 || pos.x + x >= COLS || grid[pos.y + y]?.[pos.x + x])
    )
  );
};

const rotatePiece = (piece) => {
  const rotated = piece.blocks[0].map((_, index) => piece.blocks.map(row => row[index])).reverse();
  return { ...piece, blocks: rotated };
};

const UITetris = () => {
  const [grid, setGrid] = useState(createGrid());
  const [piece, setPiece] = useState(getRandomPiece());
  const [nextPiece, setNextPiece] = useState(getRandomPiece());
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const resetGame = () => {
    setGrid(createGrid());
    setPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setPos({ x: 3, y: 0 });
    setScore(0);
    setLines(0);
    setGameOver(false);
  };

  const mergePiece = () => {
    const newGrid = grid.map(row => [...row]);
    piece.blocks.forEach((row, y) => row.forEach((cell, x) => {
      if (cell) newGrid[pos.y + y][pos.x + x] = piece.color;
    }));
    return newGrid;
  };

  const movePiece = (dx, dy) => {
    const newPos = { x: pos.x + dx, y: pos.y + dy };
    if (!checkCollision(grid, piece, newPos)) {
      setPos(newPos);
    } else if (dy > 0) {
      const newGrid = mergePiece();
      const clearedGrid = removeFullRows(newGrid);
      setGrid(clearedGrid);
      const newPiece = nextPiece;
      setNextPiece(getRandomPiece());
      const startPos = { x: 3, y: 0 };

      if (checkCollision(clearedGrid, newPiece, startPos)) {
        setGameOver(true);
      } else {
        setPiece(newPiece);
        setPos(startPos);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") movePiece(-1, 0);
    if (e.key === "ArrowRight") movePiece(1, 0);
    if (e.key === "ArrowDown") movePiece(0, 1);
    if (e.key === "ArrowUp") {
      const rotated = rotatePiece(piece);
      if (!checkCollision(grid, rotated, pos)) {
        setPiece(rotated);
      }
    }
  };

  const removeFullRows = (newGrid) => {
    let newLines = 0;
    const filteredGrid = newGrid.filter(row => {
      if (row.every(cell => cell)) {
        newLines++;
        return false;
      }
      return true;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(0));
    }

    setLines(prev => prev + newLines);
    setScore(prev => prev + newLines * 10 + (newLines > 1 ? 50 : 0));
    return filteredGrid;
  };

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, 500);
    return () => clearInterval(interval);
  }, [pos, gameOver]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pos, piece, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Tetris</h1>

      {gameOver && (
        <div className="text-center">
          <p className="text-red-500 text-xl">Game Over</p>
          <button className="mt-2 px-4 py-2 bg-blue-500 rounded" onClick={resetGame}>
            Reiniciar
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start space-x-4">
        <div
          className="grid gap-0.5 border-4 border-gray-600 p-2"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isPiece = piece.blocks.some((r, dy) =>
                r.some((c, dx) => c && pos.y + dy === y && pos.x + dx === x)
              );
              return (
                <div
                  key={`${y}-${x}`}
                  className={`w-[${CELL_SIZE}px] h-[${CELL_SIZE}px] ${
                    isPiece ? piece.color : cell || "bg-gray-700"
                  } border border-gray-800`}
                />
              );
            })
          )}
        </div>

        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="text-lg font-semibold text-white mb-2">Siguiente</p>
          <div
            className="grid gap-1 p-2 border border-gray-600 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${nextPiece.blocks[0].length}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${nextPiece.blocks.length}, ${CELL_SIZE}px)`,
            }}
          >
            {nextPiece.blocks.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`w-[${CELL_SIZE}px] h-[${CELL_SIZE}px] ${
                    cell ? nextPiece.color : "bg-gray-700"
                  } border border-gray-600`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">Puntuación: {score}</p>
        <p className="text-lg font-semibold">Líneas: {lines}</p>
      </div>

      {isMobile && (
        <div className="flex flex-col items-center mt-4">
          <div className="flex space-x-2">
            <button className="p-3 bg-blue-500 rounded" onClick={() => movePiece(-1, 0)}>⬅️</button>
            <button className="p-3 bg-green-500 rounded" onClick={() => movePiece(1, 0)}>➡️</button>
            <button className="p-3 bg-red-500 rounded" onClick={() => movePiece(0, 1)}>⬇️</button>
            <button className="p-3 bg-red-500 rounded" onClick={() => rotatePiece(0, 1)}>🔁</button>

          </div>
          <div className="flex mt-2">
          </div>
        </div>
      )}
    </div>
  );
};

export default UITetris;

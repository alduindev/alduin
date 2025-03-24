import React, { useState } from 'react';

const COLORS = [
  { bg: 'bg-red-400', emoji: '🔥' },
  { bg: 'bg-green-400', emoji: '🍃' },
  { bg: 'bg-blue-400', emoji: '💧' },
  { bg: 'bg-yellow-300', emoji: '🐞' },
  { bg: 'bg-pink-400', emoji: '🧩' },
  { bg: 'bg-purple-400', emoji: '🟣' },
  { bg: 'bg-cyan-300', emoji: '🟡' },
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const GRID_SIZE = 8;

const generateGrid = () =>
  Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    id: i,
    ...getRandomColor(),
  }));

const UIMatchStickPuzzle = () => {
  const [grid, setGrid] = useState(generateGrid());
  const [selectedId, setSelectedId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const getXY = (id) => [id % GRID_SIZE, Math.floor(id / GRID_SIZE)];
  const getIndex = (x, y) => y * GRID_SIZE + x;

  const isAdjacent = (id1, id2) => {
    const [x1, y1] = getXY(id1);
    const [x2, y2] = getXY(id2);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
  };

  const swapCells = (grid, id1, id2) => {
    const newGrid = [...grid];
    const temp = { ...newGrid[id1] };
    newGrid[id1] = { ...newGrid[id2] };
    newGrid[id2] = temp;
    return newGrid;
  };

  const findMatches = (grid) => {
    const matched = new Set();

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE - 2; x++) {
        const i1 = getIndex(x, y);
        const i2 = getIndex(x + 1, y);
        const i3 = getIndex(x + 2, y);
        const val = grid[i1].bg;
        if (val && val === grid[i2].bg && val === grid[i3].bg) {
          matched.add(i1);
          matched.add(i2);
          matched.add(i3);
        }
      }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE - 2; y++) {
        const i1 = getIndex(x, y);
        const i2 = getIndex(x, y + 1);
        const i3 = getIndex(x, y + 2);
        const val = grid[i1].bg;
        if (val && val === grid[i2].bg && val === grid[i3].bg) {
          matched.add(i1);
          matched.add(i2);
          matched.add(i3);
        }
      }
    }

    return matched;
  };

  const collapseGrid = (grid) => {
    const newGrid = [...grid];
    for (let x = 0; x < GRID_SIZE; x++) {
      let column = [];
      for (let y = GRID_SIZE - 1; y >= 0; y--) {
        const idx = getIndex(x, y);
        if (newGrid[idx].bg) {
          column.push(newGrid[idx]);
        }
      }
      for (let y = GRID_SIZE - 1; y >= 0; y--) {
        const idx = getIndex(x, y);
        newGrid[idx] = column[GRID_SIZE - 1 - y] || { id: idx, bg: null, emoji: null };
      }
    }
    return newGrid;
  };

  const fillEmptyCells = (grid) =>
    grid.map((cell) => ({
      ...cell,
      ...(cell.bg ? {} : getRandomColor()),
    }));

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleSelect = async (id) => {
    if (isAnimating) return;
  
    const cell = grid.find((c) => c.id === id);
    if (!cell || !cell.bg || !cell.emoji) return; // ❌ evitar celdas vacías
  
    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else if (isAdjacent(selectedId, id)) {
      setIsAnimating(true);
  
      let newGrid = swapCells(grid, selectedId, id);
      setGrid(newGrid);
      setSelectedId(null);
      await delay(300);
  
      let matches = findMatches(newGrid);
      if (matches.size === 0) {
        newGrid = swapCells(newGrid, selectedId, id);
        setGrid(newGrid);
        setIsAnimating(false);
        return;
      }
  
      while (matches.size > 0) {
        newGrid = newGrid.map((cell, idx) =>
          matches.has(idx) ? { ...cell, bg: null, emoji: null } : cell
        );
        setGrid([...newGrid]);
        await delay(200);
  
        newGrid = collapseGrid(newGrid);
        setGrid([...newGrid]);
        await delay(200);
  
        newGrid = fillEmptyCells(newGrid);
        setGrid([...newGrid]);
        await delay(200);
  
        matches = findMatches(newGrid);
      }
  
      setIsAnimating(false);
    } else {
      setSelectedId(id);
    }
  };
  

  const regenerateGrid = () => {
    setGrid(generateGrid());
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-8 gap-1 p-2 bg-white border rounded-lg shadow">
        {grid.map((cell) => {
          const isSelected = selectedId === cell.id;
          const isNeighbor = selectedId !== null && isAdjacent(selectedId, cell.id);

          return (
            <div
              key={cell.id}
              onClick={() => handleSelect(cell.id)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <div
                className={`w-full h-full flex items-center justify-center rounded-full text-sm select-none
                ${cell.bg || 'bg-black'}
                ${isSelected ? 'outline outline-4 outline-red-500' : ''}
                ${isNeighbor && !isSelected ? 'outline outline-2 outline-gray-300' : ''}`}
              >
                {cell.emoji || ''}
              </div>
            </div>
          );
        })}
      </div>

      {selectedId !== null && (
        <p className="text-sm text-blue-300 animate-pulse">
          Selecciona una celda para intercambiar 🔁
        </p>
      )}

      <button
        onClick={regenerateGrid}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        🔄 Regenerar colores
      </button>
    </div>
  );
};

export default UIMatchStickPuzzle;

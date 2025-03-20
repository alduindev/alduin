import React, { useRef, useEffect, useState } from "react";

const PLACE_DOG_URL = "https://placedog.net/450/450?random";
const MOVIE_IMAGE_URL = "https://via.assets.so/movie.png?id=";
const CANVAS_SIZE = 450;
const GAME_TIME = 160;
const LEVELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const SUBLEVELS = 9;
const COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-500", "bg-teal-500"
];

const UIPuzzleGame = () => {
  const canvasRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSublevel, setSelectedSublevel] = useState(null);
  const [gridSize, setGridSize] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(gridSize * gridSize - 1);
  const [gameWon, setGameWon] = useState(false);
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [progress, setProgress] = useState({});
  const [timer, setTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem("puzzleProgress")) || {};
    setProgress(savedProgress);
  }, []);

  useEffect(() => {
    if (selectedSublevel) {
      fetchRandomImage();
    }
  }, [selectedSublevel]);

  const fetchRandomImage = () => {
    const isDog = Math.random() < 0.5;
    const randomMovieID = Math.floor(Math.random() * 100) + 1;
    const imgSrc = isDog
      ? `${PLACE_DOG_URL}&nocache=${Date.now()}`
      : `${MOVIE_IMAGE_URL}${randomMovieID}&q=95&w=450&h=450&fit=fill`;

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      setImageURL(img.src);
      setImage(img);
      drawOriginalImage(img);
    };
  };

  const drawOriginalImage = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);

    if (["A", "B", "C"].includes(level)) {
      setGridSize(3);
    } else if (["D", "E", "F"].includes(level)) {
      setGridSize(4);
    } else if (["G", "H", "I"].includes(level)) {
      setGridSize(5);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setElapsedTime(0);
    initializePuzzle(image);
    startTimer();
  };

  const startTimer = () => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimer(interval);
  };

  const stopTimer = () => {
    clearInterval(timer);
  };

  const initializePuzzle = (img) => {
    const pieceSize = CANVAS_SIZE / gridSize;
    let tiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);

    do {
      tiles = shuffleArray([...tiles]);
    } while (!isSolvable(tiles));

    setPieces(tiles);
    setEmptyIndex(tiles.indexOf(gridSize * gridSize - 1));
    drawPuzzle(img, tiles, pieceSize);
  };

  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const isSolvable = (numbers) => {
    let inversions = 0;
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if (numbers[i] !== gridSize * gridSize - 1 && numbers[j] !== gridSize * gridSize - 1 && numbers[i] > numbers[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const drawPuzzle = (img, tiles, pieceSize) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    tiles.forEach((tile, index) => {
      if (tile === gridSize * gridSize - 1) return;

      const sx = (tile % gridSize) * (img.width / gridSize);
      const sy = Math.floor(tile / gridSize) * (img.height / gridSize);

      const dx = (index % gridSize) * pieceSize;
      const dy = Math.floor(index / gridSize) * pieceSize;

      ctx.drawImage(
        img,
        sx,
        sy,
        img.width / gridSize,
        img.height / gridSize,
        dx,
        dy,
        pieceSize,
        pieceSize
      );
      ctx.strokeStyle = "black";
      ctx.strokeRect(dx, dy, pieceSize, pieceSize);
    });
  };

  const moveTile = (index) => {
    if (!gameStarted) return;

    const neighbors = getMovableTiles(index);
    if (!neighbors.includes(emptyIndex)) return;

    const newTiles = [...pieces];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setPieces(newTiles);
    setEmptyIndex(index);
    drawPuzzle(image, newTiles, CANVAS_SIZE / gridSize);

    if (newTiles.every((tile, i) => tile === i)) {
      stopTimer();
      setGameWon(true);

      const updatedProgress = { ...progress };
      updatedProgress[selectedLevel] = updatedProgress[selectedLevel] || {};
      updatedProgress[selectedLevel][selectedSublevel] = true;
      localStorage.setItem("puzzleProgress", JSON.stringify(updatedProgress));
      setProgress(updatedProgress);
    }
  };

  const getMovableTiles = (index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const moves = [];

    if (row > 0) moves.push(index - gridSize);
    if (row < gridSize - 1) moves.push(index + gridSize);
    if (col > 0) moves.push(index - 1);
    if (col < gridSize - 1) moves.push(index + 1);

    return moves;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="lg:text-[4rem] text-[3rem] ">MAGICPUZZLE</h1>
      {!selectedLevel ? (
        <div className="grid grid-cols-3 gap-4">
          {LEVELS.map((level, i) => {
            const isUnlocked = i === 0 || progress[LEVELS[i - 1]]?.[SUBLEVELS];
            return (
              <button
                key={level}
                className={`p-6 text-white font-bold text-lg ${isUnlocked ? COLORS[i] : "bg-gray-400 cursor-not-allowed"
                  } rounded-lg`}
                onClick={() => isUnlocked && handleSelectLevel(level)}
                disabled={!isUnlocked}
              >
                Nivel {level}
              </button>
            );
          })}
        </div>
      ) : !selectedSublevel ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: SUBLEVELS }, (_, i) => {
            const isUnlocked = i === 0 || progress[selectedLevel]?.[i];
            return (
              <button
                key={i}
                className={`p-6 px-[2.8rem] text-white font-bold rounded-lg ${isUnlocked ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
                  }`}
                onClick={() => isUnlocked && setSelectedSublevel(i + 1)}
                disabled={!isUnlocked}
              >
                {selectedLevel}
                {i + 1}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold">
            {selectedLevel} {selectedSublevel}
          </h2>
          <p className="text-[2rem] font-semibold">⏱{elapsedTime}s</p>
          <img
            src={imageURL}
            alt="Referencia"
            className="lg:w-[20rem] w-[10rem] h-auto border border-black rounded mb-4"
          />

          {gameWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#ffffff3f] bg-opacity-90 text-center p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-green-600">
                🎉 ¡FELICIDADES! 🎉
              </h2>
              <button
                onClick={() => {
                  if (selectedSublevel < SUBLEVELS) {
                    setSelectedSublevel(selectedSublevel + 1);
                    setGameWon(false);
                    setGameStarted(false);
                  } else {
                    setSelectedLevel(null);
                    setSelectedSublevel(null);
                  }
                }}
                className="mt-4 px-6 py-3 font-bold bg-green-500 text-white rounded-lg shadow-lg hover:scale-105 transition"
              >
                {selectedSublevel < SUBLEVELS ? "Siguiente Subnivel" : "Volver al Menú"}
              </button>
            </div>
          )}
          {!gameStarted && (
            <button
              onClick={startGame}
              className="my-4 px-6 py-2 font-bold bg-blue-500 text-white rounded-lg"
            >
              Jugar
            </button>
          )}
          <div className="p-4">
          <canvas
            ref={canvasRef}
            className="border border-black bg-gray-700 w-full min-w-[300px] aspect-square"
            onClick={(e) => {
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const pieceSize = rect.width / gridSize;
              const col = Math.floor(x / pieceSize);
              const row = Math.floor(y / pieceSize);
              moveTile(row * gridSize + col);
            }}
          />
          </div>
        </>
      )}
    </div>


  );
};

export default UIPuzzleGame;

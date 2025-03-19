import React, { useRef, useEffect, useState } from "react";

const PLACE_DOG_URL = "https://placedog.net/450/450?random";
const MOVIE_IMAGE_URL = "https://via.assets.so/movie.png?id=";
const GRID_SIZE = 3;
const EMPTY_TILE = GRID_SIZE * GRID_SIZE - 1;
const CANVAS_SIZE = 450;
const GAME_TIME = 160;

const UIPuzzleGame = () => {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(EMPTY_TILE);
  const [gameWon, setGameWon] = useState(false);
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [gameTime, setGameTime] = useState(GAME_TIME);
  const [gameStarted, setGameStarted] = useState(false);
  const [lost, setLost] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchRandomImage();
  }, []);

  const fetchRandomImage = () => {
    const isDog = Math.random() < 0.5;
    const randomMovieID = Math.floor(Math.random() * 100) + 1;
    const imgSrc = isDog
      ? `${PLACE_DOG_URL}&nocache=${Date.now()}` // Imagen de perro
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
    setImageLoaded(true);
  };

  const startGame = () => {
    setGameStarted(true);
    initializePuzzle(image);
    startGameTimer();
  };

  const startGameTimer = () => {
    const gameCountdown = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          clearInterval(gameCountdown);
          setLost(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initializePuzzle = (img) => {
    const pieceSize = CANVAS_SIZE / GRID_SIZE;
    let tiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

    do {
      tiles = shuffleArray([...tiles]);
    } while (!isSolvable(tiles));

    setPieces(tiles);
    setEmptyIndex(tiles.indexOf(EMPTY_TILE));
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
        if (
          numbers[i] !== EMPTY_TILE &&
          numbers[j] !== EMPTY_TILE &&
          numbers[i] > numbers[j]
        ) {
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
      if (tile === EMPTY_TILE) return;

      const sx = (tile % GRID_SIZE) * (img.width / GRID_SIZE);
      const sy = Math.floor(tile / GRID_SIZE) * (img.height / GRID_SIZE);

      const dx = (index % GRID_SIZE) * pieceSize;
      const dy = Math.floor(index / GRID_SIZE) * pieceSize;

      ctx.drawImage(
        img,
        sx,
        sy,
        img.width / GRID_SIZE,
        img.height / GRID_SIZE,
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
    if (!gameStarted || lost) return;

    const neighbors = getMovableTiles(index);
    if (!neighbors.includes(emptyIndex)) return;

    const newTiles = [...pieces];
    [newTiles[index], newTiles[emptyIndex]] = [
      newTiles[emptyIndex],
      newTiles[index],
    ];
    setPieces(newTiles);
    setEmptyIndex(index);

    if (newTiles.every((tile, i) => tile === i)) {
      setGameWon(true);
    } else {
      redrawPuzzle(newTiles);
    }
  };

  const getMovableTiles = (index) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const moves = [];

    if (row > 0) moves.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) moves.push(index + GRID_SIZE);
    if (col > 0) moves.push(index - 1);
    if (col < GRID_SIZE - 1) moves.push(index + 1);

    return moves;
  };

  const redrawPuzzle = (tiles) => {
    if (!image) return;
    drawPuzzle(image, tiles, CANVAS_SIZE / GRID_SIZE);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameWon(false);
    setLost(false);
    setGameTime(GAME_TIME);
    setPieces([]);
    setEmptyIndex(EMPTY_TILE);
    setImage(null);
    setImageURL(null);
    setImageLoaded(false);
    fetchRandomImage();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!gameStarted && imageLoaded && !gameWon && !lost && (
        <button
          onClick={startGame}
          className="mb-4 px-6 py-2 font-bold text-gray-800 transition-all
               rounded-[15%] bg-gradient-to-br from-white to-gray-300
               shadow-[1px_1px_15px_#D9DADE,-1px_-1px_8px_#FFFFFF]
               hover:bg-[#EEF0F4] hover:shadow-[inset_9.91px_9.91px_15px_#D9DADE,inset_-9.91px_-9.91px_15px_#FFFFFF]
               active:bg-[#EEF0F4] active:shadow-[inset_9.91px_9.91px_15px_#D9DADE,inset_-9.91px_-9.91px_15px_#FFFFFF]"
        >
          Jugar
        </button>
      )}

      <div className="mb-4">
        <h2 className="text-lg text-center font-semibold">Referencia</h2>
        <img
          src={imageURL}
          alt=""
          className="w-32 h-auto object-cover border border-black rounded"
        />
      </div>

      {gameStarted && !gameWon && !lost && (
        <div className="text-blue-600 font-bold text-xl mb-4">
          ⏳ Tiempo restante: {gameTime}s
        </div>
      )}

      {gameWon ? (
        <div className="text-green-600 font-bold text-xl">🎉 ¡Ganaste! 🎉</div>
      ) : lost ? (
        <div className="text-red-600 font-bold text-xl">⏳ ¡Perdiste!</div>
      ) : (
        <canvas
          ref={canvasRef}
          className="border border-black bg-gray-700 w-full max-w-[450px] aspect-square"
          onClick={(e) => {
            if (!gameStarted) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const pieceSize = rect.width / GRID_SIZE;
            const col = Math.floor(x / pieceSize);
            const row = Math.floor(y / pieceSize);
            moveTile(row * GRID_SIZE + col);
          }}
        />
      )}
      {(gameWon || lost) && (
        <button
          onClick={resetGame}
          className="mt-4 px-6 py-2 font-bold text-gray-800 transition-all
      rounded-[15%] bg-gradient-to-br from-white to-gray-300
      shadow-[1px_1px_15px_#D9DADE,-1px_-1px_8px_#FFFFFF]
      hover:bg-[#EEF0F4] hover:shadow-[inset_9.91px_9.91px_15px_#D9DADE,inset_-9.91px_-9.91px_15px_#FFFFFF]
      active:bg-[#EEF0F4] active:shadow-[inset_9.91px_9.91px_15px_#D9DADE,inset_-9.91px_-9.91px_15px_#FFFFFF]"
        >
          Reiniciar
        </button>
      )}
    </div>
  );
};

export default UIPuzzleGame;
